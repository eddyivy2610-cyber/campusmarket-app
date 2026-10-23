import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import dbConnect from "./dbConnect";
import { isDatabaseUnavailable, databaseUnavailableResponse } from "./databaseErrors";
import { getServerAuthUser, requireAuth, requireAdmin } from "./authServer";
import { apiError, getRequestId } from "./apiResponse";
import { logger } from "./logger";

export interface WithApiOptions<TBody = any, TQuery = any, TParams = any> {
  /**
   * Authentication requirement:
   * - "none": Open to public callers (default)
   * - "user": Requires authenticated, active user session (401/403 on failure)
   * - "admin": Requires authenticated, active administrator session (401/403 on failure)
   * - "optional": Extracts user session if present, but does not reject unauthenticated callers
   */
  auth?: "none" | "user" | "admin" | "optional";

  /**
   * Zod validation schemas for request body, query parameters, or route context params.
   */
  schema?: {
    body?: z.ZodType<TBody>;
    query?: z.ZodType<TQuery>;
    params?: z.ZodType<TParams>;
  };

  /**
   * Whether to skip automatic JSON body parsing (e.g. for raw streams, uploads, or webhooks).
   * Defaults to false.
   */
  skipBodyParse?: boolean;

  /**
   * Cache control policy:
   * - "no-store": private, no-store, max-age=0, must-revalidate (Default for all writes and private reads)
   * - "public": Allows downstream handler to specify public cache directives
   * - custom string: Injects the specific Cache-Control header
   */
  cache?: "no-store" | "public" | string;

  /**
   * Automatically connect to MongoDB before handler execution. Defaults to true.
   */
  db?: boolean;
}

export interface ApiHandlerContext<TBody = any, TQuery = any, TParams = any> {
  req: NextRequest;
  params: TParams;
  body: TBody;
  query: TQuery;
  user?: any;
  admin?: any;
  requestId: string;
}

export type ApiHandler<TBody = any, TQuery = any, TParams = any> = (
  context: ApiHandlerContext<TBody, TQuery, TParams>
) => Promise<NextResponse | Response> | NextResponse | Response;

/**
 * Standardized API Route Handler Wrapper.
 *
 * Implements:
 * 1. Declarative authentication and RBAC checks (401 / 403).
 * 2. Zod schema validation for body, query params, and context params (400).
 * 3. Error mapping:
 *    - MongoDB Duplicate Key (E11000) -> 409 Conflict
 *    - Mongoose VersionError (Optimistic Concurrency) -> 409 Conflict
 *    - Zod Validation Error -> 400 Bad Request
 *    - Unexpected errors -> generic 500 (with diagnostic details retained in server logs)
 * 4. Structured request logging with x-request-id and timing.
 * 5. Private/no-store default cache policy preventing leaking personalized data.
 * 6. Flexible support for raw uploads, streams, and webhooks via skipBodyParse.
 */
export function withApi<TBody = any, TQuery = any, TParams = any>(
  options: WithApiOptions<TBody, TQuery, TParams>,
  handler: ApiHandler<TBody, TQuery, TParams>
) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<TParams> | TParams }
  ): Promise<NextResponse | Response> => {
    const startTime = Date.now();
    const requestId = getRequestId(req);
    const method = req.method;
    const path = req.nextUrl.pathname;

    let authUser: any = undefined;
    let authAdmin: any = undefined;

    try {
      // 1. Establish database connection if enabled (default true)
      if (options.db !== false) {
        await dbConnect();
      }

      // 2. Authentication Enforcement
      if (options.auth === "user") {
        const { user, errorResponse } = await requireAuth(req);
        if (!user || errorResponse) {
          return errorResponse || apiError("Unauthorized", { status: 401, req });
        }
        authUser = user;
      } else if (options.auth === "admin") {
        const { admin, errorResponse } = await requireAdmin(req);
        if (!admin || errorResponse) {
          return errorResponse || apiError("Forbidden: Administrator access required.", { status: 403, req });
        }
        authAdmin = admin;
        authUser = admin;
      } else if (options.auth === "optional") {
        authUser = getServerAuthUser(req) || undefined;
      }

      // 3. Resolve route params
      let resolvedParams: any = {};
      if (context?.params) {
        resolvedParams = context.params instanceof Promise ? await context.params : context.params;
        if (options.schema?.params) {
          const parsedParams = options.schema.params.safeParse(resolvedParams);
          if (!parsedParams.success) {
            return apiError("Invalid route parameters.", {
              status: 400,
              code: "VALIDATION_ERROR",
              details: parsedParams.error.flatten(),
              req,
            });
          }
          resolvedParams = parsedParams.data;
        }
      }

      // 4. Resolve and validate query parameters
      let resolvedQuery: any = {};
      if (options.schema?.query) {
        const queryObj: Record<string, string> = {};
        req.nextUrl.searchParams.forEach((val, key) => {
          queryObj[key] = val;
        });
        const parsedQuery = options.schema.query.safeParse(queryObj);
        if (!parsedQuery.success) {
          return apiError("Invalid query parameters.", {
            status: 400,
            code: "VALIDATION_ERROR",
            details: parsedQuery.error.flatten(),
            req,
          });
        }
        resolvedQuery = parsedQuery.data;
      }

      // 5. Resolve and validate body
      let resolvedBody: any = undefined;
      const hasBody = !["GET", "HEAD"].includes(method);
      if (hasBody && !options.skipBodyParse) {
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          try {
            resolvedBody = await req.json();
          } catch {
            return apiError("Malformed JSON request body.", {
              status: 400,
              code: "MALFORMED_JSON",
              req,
            });
          }
        }

        if (options.schema?.body) {
          const parsedBody = options.schema.body.safeParse(resolvedBody);
          if (!parsedBody.success) {
            return apiError("Request validation failed.", {
              status: 400,
              code: "VALIDATION_ERROR",
              details: parsedBody.error.flatten(),
              req,
            });
          }
          resolvedBody = parsedBody.data;
        }
      }

      // 6. Execute inner handler
      const response = await handler({
        req,
        params: resolvedParams,
        body: resolvedBody,
        query: resolvedQuery,
        user: authUser,
        admin: authAdmin,
        requestId,
      });

      // 7. Apply cache headers and x-request-id
      const finalHeaders = new Headers(response.headers);
      if (!finalHeaders.has("x-request-id")) {
        finalHeaders.set("x-request-id", requestId);
      }

      // Default cache policy: private/no-store unless explicitly opted into public caching
      const cachePolicy = options.cache || "no-store";
      if (cachePolicy === "no-store" && !finalHeaders.has("Cache-Control")) {
        finalHeaders.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
      } else if (cachePolicy !== "public" && cachePolicy !== "no-store" && !finalHeaders.has("Cache-Control")) {
        finalHeaders.set("Cache-Control", cachePolicy);
      }

      // Clone or wrap response with updated headers if necessary
      const durationMs = Date.now() - startTime;
      logger.info(`[API] ${method} ${path} -> ${response.status} (${durationMs}ms)`, {
        requestId,
        method,
        path,
        status: response.status,
        durationMs,
        userId: authUser?.id,
      });

      // If headers modified, return response with applied headers
      if (response instanceof NextResponse) {
        finalHeaders.forEach((val, key) => response.headers.set(key, val));
        return response;
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: finalHeaders,
      });
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      if (isDatabaseUnavailable(error)) {
        logger.error(`[API] ${method} ${path} database unavailable`, { requestId, durationMs });
        return databaseUnavailableResponse();
      }

      // 8. Error Mapping
      // A. Zod Validation Error
      if (error instanceof ZodError) {
        logger.warn(`[API] ${method} ${path} validation failed`, {
          requestId,
          details: error.flatten(),
          durationMs,
        });
        return apiError("Request validation failed.", {
          status: 400,
          code: "VALIDATION_ERROR",
          details: error.flatten(),
          req,
        });
      }

      // B. MongoDB Duplicate Key (E11000)
      const isDuplicateKey =
        error?.code === 11000 ||
        (typeof error?.message === "string" && error.message.includes("E11000"));
      if (isDuplicateKey) {
        logger.warn(`[API] ${method} ${path} conflict: duplicate key`, {
          requestId,
          durationMs,
        });
        return apiError("Conflict: a record with these unique details already exists.", {
          status: 409,
          code: "DUPLICATE_KEY_CONFLICT",
          req,
        });
      }

      // C. Mongoose Optimistic Locking (VersionError)
      const isVersionError =
        error?.name === "VersionError" ||
        (typeof error?.message === "string" && error.message.includes("No matching document found for id"));
      if (isVersionError) {
        logger.warn(`[API] ${method} ${path} conflict: version error`, {
          requestId,
          durationMs,
        });
        return apiError("Conflict: the resource was modified by another operation. Please reload and try again.", {
          status: 409,
          code: "CONCURRENCY_CONFLICT",
          req,
        });
      }

      // D. Known HTTP Status Errors
      if (typeof error?.status === "number" && error.status >= 400 && error.status < 600) {
        logger.warn(`[API] ${method} ${path} error ${error.status}: ${error.message}`, {
          requestId,
          durationMs,
        });
        return apiError(error.message || "Request failed.", {
          status: error.status,
          code: error.code || "REQUEST_ERROR",
          details: error.details,
          req,
        });
      }

      // E. Unexpected Server Errors (500)
      // Log diagnostic details internally, return clean generic payload to client
      logger.error(`[API] ${method} ${path} unexpected internal error: ${error?.message || error}`, {
        requestId,
        error: error?.stack || error?.message || error,
        durationMs,
      });

      return apiError("An internal server error occurred. Please try again later.", {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        req,
      });
    }
  };
}
