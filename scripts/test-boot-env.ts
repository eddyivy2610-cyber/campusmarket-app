import { validateEnv as validateNextEnv } from "../app/lib/env";
import { validateEnv as validateExpressEnv } from "../campus-hive-backend/utils/env.js";

console.log("==================================================================");
console.log(" CAMPUS HIVE 2.0 — BOOT-TIME ZOD ENVIRONMENT CHECK TEST SUITE");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    failed++;
  }
}

// 1. Next.js App: Missing AUTH_SECRET
console.log("--- TEST GROUP 1: Next.js Missing or Short AUTH_SECRET ---");
try {
  validateNextEnv({
    NODE_ENV: "production",
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "short-key-under-32-chars",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "app-password",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Should have crashed on boot when AUTH_SECRET is under 32 characters");
} catch (err: any) {
  assert(
    err.message.includes("AUTH_SECRET"),
    "Next.js crashed on boot when AUTH_SECRET was under 32 characters"
  );
}

// 2. Next.js App: Missing MONGODB_URI
console.log("\n--- TEST GROUP 2: Next.js Missing MONGODB_URI ---");
try {
  validateNextEnv({
    NODE_ENV: "production",
    MONGODB_URI: "",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "app-password",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Should have crashed on boot when MONGODB_URI is missing");
} catch (err: any) {
  assert(
    err.message.includes("MONGODB_URI"),
    "Next.js crashed on boot when MONGODB_URI was missing"
  );
}

// 3. Next.js App: Missing SMTP Credentials
console.log("\n--- TEST GROUP 3: Next.js Missing SMTP Variables ---");
try {
  validateNextEnv({
    NODE_ENV: "production",
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Should have crashed on boot when SMTP credentials are missing");
} catch (err: any) {
  assert(
    err.message.includes("SMTP_USER") || err.message.includes("SMTP_PASSWORD"),
    "Next.js crashed on boot when SMTP credentials were missing"
  );
}

// 4. Next.js App: Valid Configuration
console.log("\n--- TEST GROUP 4: Next.js Valid Environment ---");
try {
  const valid = validateNextEnv({
    NODE_ENV: "production",
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "baas llff aehd uorc",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    ADMIN_REGISTRATION_KEY: "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d",
  });
  assert(
    valid.AUTH_SECRET === "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    "Next.js successfully booted with validated environment variables"
  );
} catch (err: any) {
  assert(false, `Next.js should have succeeded but failed: ${err.message}`);
}

// 5. Express Backend: Missing AUTH_SECRET
console.log("\n--- TEST GROUP 5: Express Backend Missing or Short AUTH_SECRET ---");
try {
  validateExpressEnv({
    NODE_ENV: "production",
    PORT: 4000,
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "short-key-under-32-chars",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "app-password",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Express should have crashed on boot when AUTH_SECRET is under 32 characters");
} catch (err: any) {
  assert(
    err.message.includes("AUTH_SECRET"),
    "Express crashed on boot when AUTH_SECRET was under 32 characters"
  );
}

// 6. Express Backend: Missing MONGODB_URI
console.log("\n--- TEST GROUP 6: Express Backend Missing MONGODB_URI ---");
try {
  validateExpressEnv({
    NODE_ENV: "production",
    PORT: 4000,
    MONGODB_URI: "",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "app-password",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Express should have crashed on boot when MONGODB_URI is missing");
} catch (err: any) {
  assert(
    err.message.includes("MONGODB_URI"),
    "Express crashed on boot when MONGODB_URI was missing"
  );
}

// 7. Express Backend: Missing SMTP Credentials
console.log("\n--- TEST GROUP 7: Express Backend Missing SMTP Variables ---");
try {
  validateExpressEnv({
    NODE_ENV: "production",
    PORT: 4000,
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
    ADMIN_REGISTRATION_KEY: "admin-reg-key",
  });
  assert(false, "Express should have crashed on boot when SMTP credentials are missing");
} catch (err: any) {
  assert(
    err.message.includes("SMTP_USER") || err.message.includes("SMTP_PASSWORD"),
    "Express crashed on boot when SMTP credentials were missing"
  );
}

// 8. Express Backend: Valid Configuration
console.log("\n--- TEST GROUP 8: Express Backend Valid Environment ---");
try {
  const validExpress = validateExpressEnv({
    NODE_ENV: "production",
    PORT: 4000,
    MONGODB_URI: "mongodb://localhost:27017/campushive",
    AUTH_SECRET: "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    SMTP_USER: "eddyivy2610@gmail.com",
    SMTP_PASSWORD: "baas llff aehd uorc",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: 587,
    ADMIN_REGISTRATION_KEY: "8d5d7b74307df7e49fa1f5958b0a7297a8560e547ba6432d",
  });
  assert(
    validExpress.AUTH_SECRET === "05424a103b50abcc542d468905db5617c94ad6b78cb3b2975eb7e3af4e45e8f5",
    "Express successfully booted with validated environment variables"
  );
} catch (err: any) {
  assert(false, `Express should have succeeded but failed: ${err.message}`);
}

console.log("\n==================================================================");
console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
}

console.log("\n==================================================================");
console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
}
