import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function main() {
  const root = process.cwd();
  const enumsPath = path.join(root, "app/constants/enums.ts");
  const healthPath = path.join(root, "app/api/health/route.ts");
  const storesRoutePath = path.join(root, "app/api/stores/route.ts");
  const authServerPath = path.join(root, "app/lib/authServer.ts");

  const healthSrc = fs.readFileSync(healthPath, "utf8");
  const storesSrc = fs.readFileSync(storesRoutePath, "utf8");
  const authSrc = fs.readFileSync(authServerPath, "utf8");

  assert.ok(
    healthSrc.includes('from "@/constants/enums"') && healthSrc.includes("maxStoresPerUser: MAX_STORES_PER_USER"),
    "health route must import MAX_STORES_PER_USER from @/constants/enums"
  );
  assert.ok(
    !healthSrc.includes("process.env.MAX_STORES_PER_USER"),
    "health route must not read process.env.MAX_STORES_PER_USER independently"
  );
  assert.ok(
    storesSrc.includes('from "@/constants/enums"') && storesSrc.includes("storesCount: { $lt: MAX_STORES_PER_USER }"),
    "stores route must enforce atomic storesCount guard using MAX_STORES_PER_USER from @/constants/enums"
  );
  assert.ok(
    authSrc.includes("constants/enums") && authSrc.includes("MAX_STORES_PER_USER"),
    "authServer must use MAX_STORES_PER_USER from constants/enums"
  );

  // Verify default is 1 when env is unset
  const prevEnv = process.env.MAX_STORES_PER_USER;
  delete process.env.MAX_STORES_PER_USER;
  const enumsUrl = pathToFileURL(enumsPath).href;
  const enumsMod = await import(`${enumsUrl}?defaultCheck=${Date.now()}`);
  assert.equal(enumsMod.MAX_STORES_PER_USER, 1, "MAX_STORES_PER_USER must default to 1");

  // Verify custom value 3 is read once and matches
  process.env.MAX_STORES_PER_USER = "3";
  const enumsMod3 = await import(`${enumsUrl}?cap3Check=${Date.now()}`);
  assert.equal(enumsMod3.MAX_STORES_PER_USER, 3, "MAX_STORES_PER_USER must read 3 from env");

  if (prevEnv === undefined) {
    delete process.env.MAX_STORES_PER_USER;
  } else {
    process.env.MAX_STORES_PER_USER = prevEnv;
  }

  console.log("[PASS] MAX_STORES_PER_USER single source of truth verified (default=1, env=3, shared by health, stores route, and authServer).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
