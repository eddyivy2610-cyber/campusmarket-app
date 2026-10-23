import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
process.env.OTP_PEPPER = process.env.OTP_PEPPER || "auth-signup-test-pepper-32-characters-long";

const { generateOtp, hashOtp } = await import("../app/lib/otpService");
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

function check(name: string, condition: boolean) {
  assert.equal(condition, true, name);
  console.log(`PASS: ${name}`);
}

const register = read("app/api/auth/register/route.ts");
const loginRoute = read("app/api/auth/login/route.ts");
const loginPage = read("app/(auth)/login/page.tsx");
const registerPage = read("app/(auth)/register/page.tsx");
const userModel = read("app/models/User.ts");
const apiClient = read("app/lib/apiClient.ts");

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(relative) : /\.(ts|tsx|js|jsx)$/.test(entry.name) ? [relative] : [];
  });
}

check("registration route exists and starts accounts as buyer/pending", /role:\s*"buyer"/.test(register) && /accountStatus:\s*"pending"/.test(register));
check("registration route does not overwrite pending credentials before verification", !/existingUser\.password\s*=/.test(register));
check("login route uses Argon2 and verification/account-status gates", /argon2/.test(loginRoute) && /emailVerified/.test(loginRoute) && /accountStatus/.test(loginRoute));
const demoUserMarker = ["usr", "-demo"].join("");
const demoTokenMarker = ["demo", "_token_signed"].join("");
check("login page has no demo authentication fallback", !loginPage.includes(demoUserMarker) && !loginPage.includes(demoTokenMarker) && !loginPage.includes("fallback" + "User"));
check("Google bypass is feature-gated", /googleEnabled/.test(loginPage) && /googleEnabled/.test(registerPage));
check("schema defaults account status to pending", /accountStatus[\s\S]{0,180}default:\s*"pending"/.test(userModel));
check("client API does not read campus tokens from localStorage", !/localStorage\.getItem\(["']campus_token["']\)/.test(apiClient));

const otp = generateOtp();
check("OTP is six numeric digits", /^\d{6}$/.test(otp));
check("OTP hash is not equal to the raw OTP", hashOtp("audit@example.test", otp) !== otp);

const forbidden = [
  ["usr", "-demo"].join(""),
  ["tunde", "bello"].join(""),
  ["DEFAULT", "_CURRENT_USER"].join(""),
  ["DEFAULT", "_PROFILE_DATA"].join(""),
  ["PROFILES", "_BY_HANDLE"].join(""),
];
const forbiddenHits = sourceFiles("app").flatMap((file) => {
  const contents = read(file);
  return forbidden.filter((marker) => contents.includes(marker)).map((marker) => `${file}:${marker}`);
});
check("application source contains no known demo authentication/profile markers", forbiddenHits.length === 0);

console.log("Auth signup static guard checks completed.");
