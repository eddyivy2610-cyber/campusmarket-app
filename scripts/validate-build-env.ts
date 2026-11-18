import { validateEnv } from "../app/lib/env";

validateEnv();
console.log("[BuildEnv] Environment validation passed (including MAX_STORES_PER_USER).");
