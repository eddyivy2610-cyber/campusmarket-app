/**
 * scripts/test-all-ci.ts
 *
 * Master CI Test Runner for Campus Hive 2.0.
 * Executes all security, regression, query-plan, and migration test suites sequentially.
 *
 * Usage:
 *   npx tsx scripts/test-all-ci.ts
 */

import { execSync } from "child_process";

interface Suite {
  name: string;
  script: string;
}

const SUITES: Suite[] = [
  { name: "Query Plan & Index Regressions (zero COLLSCAN/SORT)", script: "scripts/test-query-plans-ci.ts" },
  { name: "Authentication, Tokens, & RBAC Security Suite", script: "scripts/test-auth-security.ts" },
  { name: "Phase 4.6: Reviews Migration Suite (20 assertions)", script: "scripts/test-phase4-reviews.ts" },
  { name: "Phase 4.5: Seller Dashboard Statistics Suite", script: "scripts/test-phase4-seller-stats.ts" },
  { name: "Phase 4.3: Orders Migration & State Machine Suite", script: "scripts/test-phase4-orders.ts" },
  { name: "Phase 4.4: Follow Relationships & Concurrency Suite", script: "scripts/test-phase4-follow.ts" },
  { name: "HTTP Cache-Control & Private Data Isolation Suite", script: "scripts/test-cache-leak.ts" },
  { name: "Marketplace Concurrency & Load Benchmark Suite", script: "scripts/benchmark-load-concurrency.ts" },
];

async function main() {
  console.log("==================================================================");
  console.log("          CAMPUS HIVE 2.0 — MASTER CI AUTOMATED TEST SUITE        ");
  console.log("==================================================================\n");

  const startTime = Date.now();
  let passedSuites = 0;
  let failedSuites = 0;
  const failureDetails: string[] = [];

  for (let i = 0; i < SUITES.length; i++) {
    const suite = SUITES[i];
    console.log(`\n[${i + 1}/${SUITES.length}] RUNNING: ${suite.name}...`);
    const suiteStart = Date.now();
    try {
      execSync(`npx tsx ${suite.script}`, {
        stdio: ["ignore", "inherit", "inherit"],
        timeout: 180000, // 3 minute maximum per suite
        env: { ...process.env, NODE_ENV: "test" },
      });
      const duration = ((Date.now() - suiteStart) / 1000).toFixed(1);
      console.log(`>>> PASS: ${suite.name} (${duration}s)\n`);
      passedSuites++;
    } catch (err: any) {
      const duration = ((Date.now() - suiteStart) / 1000).toFixed(1);
      console.error(`>>> FAIL: ${suite.name} (${duration}s)`);
      failedSuites++;
      failureDetails.push(suite.name);
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n==================================================================");
  console.log("                     MASTER CI SUITE SUMMARY                      ");
  console.log("==================================================================");
  console.log(`Total Suites Run: ${SUITES.length}`);
  console.log(`Passed Suites:    ${passedSuites}`);
  console.log(`Failed Suites:    ${failedSuites}`);
  console.log(`Total Duration:   ${totalDuration}s`);
  console.log("==================================================================\n");

  if (failedSuites > 0) {
    console.error("❌ The following test suites failed:");
    for (const name of failureDetails) {
      console.error(`  - ${name}`);
    }
    process.exit(1);
  }

  console.log("✅ ALL TEST SUITES PASSED CLEANLY WITH ZERO REGRESSIONS!\n");
  process.exit(0);
}

main();
