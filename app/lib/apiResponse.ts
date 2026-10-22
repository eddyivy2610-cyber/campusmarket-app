import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface ApiResponseOptions {
  status?: number;
  headers?: HeadersInit;
  req?: NextRequest;
}

export interface ApiSuccessBody<T = any> {
  success: true;
  message?: string;
  data?: T;
  meta?: Record<string, any>;
  requestId?: string;
  [key: string]: any;
}

export interface ApiErrorBody {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
}

/**
 * Extracts the traceable request ID from NextRequest headers.
 */
export function getRequestId(req?: NextRequest): string {
  if (!req) return crypto.randomUUID();
  return req.headers.get("x-request-id") || crypto.randomUUID();
}

/**
 * Returns a standardized JSON success response.
 */
export function apiSuccess<T = any>(
  data?: T,
  options: ApiResponseOptions & {
    message?: string;
    meta?: Record<string, any>;
    extra?: Record<string, any>;
  } = {}
): NextResponse<ApiSuccessBody<T>> {
  const { status = 200, headers = {}, req, message, meta, extra = {} } = options;
  const requestId = getRequestId(req);

  const body: ApiSuccessBody<T> = {
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(meta ? { meta } : {}),
    requestId,
    ...extra,
  };

  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("x-request-id")) {
    responseHeaders.set("x-request-id", requestId);
  }

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Returns a standardized JSON error response.
 */
export function apiError(
  error: string,
  options: ApiResponseOptions & {
    code?: string;
    details?: any;
  } = {}
): NextResponse<ApiErrorBody> {
  const { status = 500, headers = {}, req, code, details } = options;
  const requestId = getRequestId(req);

  const body: ApiErrorBody = {
    success: false,
    error,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
    requestId,
  };

  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("x-request-id")) {
    responseHeaders.set("x-request-id", requestId);
  }

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}
