import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import UserModel, { User } from "../app/models/User";
import BannerModel, { isValidCtaUrl, isValidImageUrl } from "../app/models/Banner";
import {
  isBannerEligible,
  compareBannersDeterministic,
  getEligibleBanners,
  calculateNextScheduleTtl,
  detectHomepageHeroConflict,
  serializePublicBanner,
} from "../app/lib/bannerService";
import { createAccessToken } from "../app/lib/authTokens";
import { UPLOAD_POLICIES } from "../app/lib/uploadPolicy";
import { GET as getAdminBanners, POST as createAdminBanner } from "../app/api/admin/banners/route";
import { GET as getBannerById, PATCH as patchBannerById } from "../app/api/admin/banners/[id]/route";
import { POST as publishBanner } from "../app/api/admin/banners/[id]/publish/route";
import { POST as unpublishBanner } from "../app/api/admin/banners/[id]/unpublish/route";
import { POST as archiveBanner } from "../app/api/admin/banners/[id]/archive/route";
import { GET as getActiveBanners } from "../app/api/banners/active/route";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${desc}`);
    failed++;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log(" CAMPUS HIVE 2.0 — DYNAMIC BANNER MANAGEMENT TEST SUITE");
  console.log("==================================================================\n");

  const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = repl.getUri();
  process.env.AUTH_SECRET = "banner-security-test-secret-at-least-32-chars-long";
  await mongoose.connect(repl.getUri());

  // 1. Setup Test Users
  const adminUser = await UserModel.create({
    name: "Admin Banner Tester",
    email: "admin-banner@campushive.test",
    role: "admin",
    accountStatus: "active",
    isStudent: true,
    studentVerified: true,
  });

  const studentUser = await UserModel.create({
    name: "Student Buyer Tester",
    email: "buyer-banner@campushive.test",
    role: "buyer",
    accountStatus: "active",
    isStudent: true,
    studentVerified: true,
  });

  const adminToken = createAccessToken({
    id: adminUser._id.toString(),
    name: adminUser.name,
    email: adminUser.email,
    role: "admin",
    isStudent: true,
    studentVerified: true,
  });

  const studentToken = createAccessToken({
    id: studentUser._id.toString(),
    name: studentUser.name,
    email: studentUser.email,
    role: "buyer",
    isStudent: true,
    studentVerified: true,
  });

  // =========================================================================
  // TEST GROUP 1: Schedule Eligibility Half-Open Interval [startAt <= now < endAt]
  // =========================================================================
  console.log("\n--- 1. Schedule Eligibility & Controllable Clock Tests ---");
  {
    const start = new Date("2026-10-22T10:00:00.000Z");
    const end = new Date("2026-10-22T12:00:00.000Z");

    const sample = {
      status: "published",
      startAt: start,
      endAt: end,
      headline: "Special Tech Deal",
      ctaLabel: "Shop",
      ctaUrl: "/explore",
      imageUrl: "https://res.cloudinary.com/campushive/banner.png",
      imageAlt: "Tech laptop deals",
    };

    // Before startAt
    const beforeStart = new Date("2026-10-22T09:59:59.999Z");
    assert(
      !isBannerEligible(sample, beforeStart),
      "Banner is NOT eligible before startAt (now < startAt)"
    );

    // Exactly at startAt
    assert(
      isBannerEligible(sample, start),
      "Banner IS eligible exactly at startAt (startAt <= now)"
    );

    // Mid interval
    const midInterval = new Date("2026-10-22T11:00:00.000Z");
    assert(
      isBannerEligible(sample, midInterval),
      "Banner IS eligible during scheduled interval"
    );

    // 1 millisecond before endAt
    const justBeforeEnd = new Date("2026-10-22T11:59:59.999Z");
    assert(
      isBannerEligible(sample, justBeforeEnd),
      "Banner IS eligible right before endAt"
    );

    // Exactly at endAt
    assert(
      !isBannerEligible(sample, end),
      "Banner is NOT eligible exactly at endAt (half-open: now < endAt)"
    );

    // After endAt
    const afterEnd = new Date("2026-10-22T12:00:01.000Z");
    assert(
      !isBannerEligible(sample, afterEnd),
      "Banner is NOT eligible after endAt"
    );

    // Indefinite banner (endAt: null)
    const indefiniteBanner = {
      ...sample,
      endAt: null,
    };
    const farFuture = new Date("2035-01-01T00:00:00.000Z");
    assert(
      isBannerEligible(indefiniteBanner, farFuture),
      "Banner with null endAt remains eligible indefinitely"
    );
  }

  // =========================================================================
  // TEST GROUP 2: Status & Display Field Verification
  // =========================================================================
  console.log("\n--- 2. Publication Status & Field Invariant Tests ---");
  {
    const now = new Date("2026-10-22T10:00:00.000Z");
    const base = {
      startAt: new Date("2026-10-22T09:00:00.000Z"),
      endAt: null,
      headline: "Headline",
      ctaLabel: "CTA",
      ctaUrl: "/link",
      imageUrl: "https://example.com/img.jpg",
      imageAlt: "Alt text",
    };

    assert(
      !isBannerEligible({ ...base, status: "draft" }, now),
      "Draft status is NEVER eligible"
    );

    assert(
      !isBannerEligible({ ...base, status: "scheduled" }, now),
      "Scheduled status is not publicly eligible (must be published status)"
    );

    assert(
      !isBannerEligible({ ...base, status: "archived" }, now),
      "Archived status is NEVER eligible"
    );

    assert(
      isBannerEligible({ ...base, status: "published" }, now),
      "Published status within schedule is eligible"
    );

    assert(
      !isBannerEligible({ ...base, status: "published", headline: "" }, now),
      "Missing headline disqualifies banner"
    );

    assert(
      !isBannerEligible({ ...base, status: "published", imageUrl: "" }, now),
      "Missing imageUrl disqualifies banner"
    );

    assert(
      !isBannerEligible({ ...base, status: "published", imageAlt: "" }, now),
      "Missing imageAlt disqualifies banner"
    );
  }

  // =========================================================================
  // TEST GROUP 3: Priority Ordering & All Tie-Breakers
  // =========================================================================
  console.log("\n--- 3. Priority Ordering & Deterministic Tie-Breaking Tests ---");
  {
    const t0 = new Date("2026-10-22T10:00:00.000Z");
    const t1 = new Date("2026-10-22T10:05:00.000Z");
    const c0 = new Date("2026-10-22T08:00:00.000Z");
    const c1 = new Date("2026-10-22T08:05:00.000Z");

    // Tie-breaker 1: Priority descending
    const bLow = { priority: 10, startAt: t0, createdAt: c0, _id: "bbb" };
    const bHigh = { priority: 50, startAt: t1, createdAt: c1, _id: "aaa" };
    assert(
      compareBannersDeterministic(bLow, bHigh) > 0,
      "Higher priority wins regardless of schedule and createdAt"
    );

    // Tie-breaker 2: Earliest startAt ascending
    const bStartEarlier = { priority: 50, startAt: t0, createdAt: c1, _id: "bbb" };
    const bStartLater = { priority: 50, startAt: t1, createdAt: c0, _id: "aaa" };
    assert(
      compareBannersDeterministic(bStartEarlier, bStartLater) < 0,
      "Same priority: Earliest startAt wins"
    );

    // Tie-breaker 3: Earliest createdAt ascending
    const bCreatedEarlier = { priority: 50, startAt: t0, createdAt: c0, _id: "bbb" };
    const bCreatedLater = { priority: 50, startAt: t0, createdAt: c1, _id: "aaa" };
    assert(
      compareBannersDeterministic(bCreatedEarlier, bCreatedLater) < 0,
      "Same priority and startAt: Earliest createdAt wins"
    );

    // Tie-breaker 4: Lexicographical smallest ID
    const bIdA = { priority: 50, startAt: t0, createdAt: c0, _id: "111111111111111111111111" };
    const bIdB = { priority: 50, startAt: t0, createdAt: c0, _id: "222222222222222222222222" };
    assert(
      compareBannersDeterministic(bIdA, bIdB) < 0,
      "Same priority, startAt, and createdAt: Smaller immutable ID wins"
    );
  }

  // =========================================================================
  // TEST GROUP 4: Database Query & Homepage Hero Single Selection
  // =========================================================================
  console.log("\n--- 4. Database Selection Engine & Overlapping Hero Tests ---");
  {
    await BannerModel.deleteMany({});
    const now = new Date("2026-10-22T10:00:00.000Z");

    // Insert multiple published homepage hero banners
    await BannerModel.create([
      {
        name: "Hero Low Priority",
        headline: "Hero Low Priority",
        imageUrl: "https://example.com/1.jpg",
        imageAlt: "Low",
        ctaLabel: "Shop",
        ctaUrl: "/explore",
        placement: "homepage_hero",
        status: "published",
        startAt: new Date("2026-10-22T08:00:00.000Z"),
        endAt: null,
        priority: 10,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      },
      {
        name: "Hero High Priority",
        headline: "Hero High Priority Winner",
        imageUrl: "https://example.com/2.jpg",
        imageAlt: "High",
        ctaLabel: "Shop",
        ctaUrl: "/explore",
        placement: "homepage_hero",
        status: "published",
        startAt: new Date("2026-10-22T08:00:00.000Z"),
        endAt: null,
        priority: 100,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      },
      {
        name: "Hero Expired",
        headline: "Hero Expired",
        imageUrl: "https://example.com/3.jpg",
        imageAlt: "Expired",
        ctaLabel: "Shop",
        ctaUrl: "/explore",
        placement: "homepage_hero",
        status: "published",
        startAt: new Date("2026-10-22T07:00:00.000Z"),
        endAt: new Date("2026-10-22T09:00:00.000Z"), // Expired
        priority: 500,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      },
      {
        name: "Hero Future Scheduled",
        headline: "Hero Future Scheduled",
        imageUrl: "https://example.com/4.jpg",
        imageAlt: "Future",
        ctaLabel: "Shop",
        ctaUrl: "/explore",
        placement: "homepage_hero",
        status: "published",
        startAt: new Date("2026-10-22T11:00:00.000Z"), // In future
        endAt: null,
        priority: 999,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      },
    ]);

    const heroes = await getEligibleBanners({
      placement: "homepage_hero",
      now,
    });

    assert(heroes.length === 1, "Exactly ONE hero banner is returned for homepage_hero");
    assert(
      heroes[0].headline === "Hero High Priority Winner",
      "Selected hero matches highest priority eligible campaign"
    );

    // Test conflict detection helper
    const conflict = await detectHomepageHeroConflict({
      startAt: new Date("2026-10-22T08:00:00.000Z"),
      endAt: null,
      priority: 100,
    });
    assert(
      conflict.hasConflict === true,
      "Conflict detector flags overlapping hero campaign at the same priority"
    );

    const nonConflict = await detectHomepageHeroConflict({
      startAt: new Date("2026-10-22T08:00:00.000Z"),
      endAt: null,
      priority: 88, // Distinct priority
    });
    assert(
      nonConflict.hasConflict === false,
      "Conflict detector passes when priorities are distinct"
    );
  }

  // =========================================================================
  // TEST GROUP 5: Category Promo Isolation & Placement Limits
  // =========================================================================
  console.log("\n--- 5. Category Isolation & Placement Limits Tests ---");
  {
    await BannerModel.deleteMany({});
    const now = new Date("2026-10-22T10:00:00.000Z");

    // Insert 5 promo_strip banners and 5 category_promo banners
    for (let i = 1; i <= 5; i++) {
      await BannerModel.create({
        name: `Promo Strip ${i}`,
        headline: `Promo Strip Headline ${i}`,
        imageUrl: `https://example.com/strip-${i}.jpg`,
        imageAlt: `Strip ${i}`,
        ctaLabel: "Check Out",
        ctaUrl: `/explore?item=${i}`,
        placement: "promo_strip",
        status: "published",
        startAt: new Date("2026-10-22T08:00:00.000Z"),
        endAt: null,
        priority: i * 10,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      });
    }

    // Category promos: 3 for Electronics, 2 for Fashion
    for (let i = 1; i <= 3; i++) {
      await BannerModel.create({
        name: `Electronics Promo ${i}`,
        headline: `Electronics Headline ${i}`,
        imageUrl: `https://example.com/elec-${i}.jpg`,
        imageAlt: `Electronics ${i}`,
        ctaLabel: "Shop Tech",
        ctaUrl: "/explore?category=Electronics",
        placement: "category_promo",
        targetCategory: "Electronics",
        status: "published",
        startAt: new Date("2026-10-22T08:00:00.000Z"),
        endAt: null,
        priority: i,
        createdBy: adminUser._id.toString(),
        updatedBy: adminUser._id.toString(),
      });
    }

    await BannerModel.create({
      name: "Fashion Promo",
      headline: "Fashion Deal",
      imageUrl: "https://example.com/fashion.jpg",
      imageAlt: "Fashion",
      ctaLabel: "Shop Style",
      ctaUrl: "/explore?category=Fashion",
      placement: "category_promo",
      targetCategory: "Fashion",
      status: "published",
      startAt: new Date("2026-10-22T08:00:00.000Z"),
      endAt: null,
      priority: 100,
      createdBy: adminUser._id.toString(),
      updatedBy: adminUser._id.toString(),
    });

    // Check promo_strip default limit (max 3)
    const strips = await getEligibleBanners({
      placement: "promo_strip",
      now,
    });
    assert(strips.length === 3, "Promo strip enforces default maximum limit of 3");
    assert(
      strips[0].priority === 50 && strips[1].priority === 40 && strips[2].priority === 30,
      "Promo strip returns top 3 items sorted by priority descending"
    );

    // Check category promo isolation
    const elecPromos = await getEligibleBanners({
      placement: "category_promo",
      category: "Electronics",
      now,
    });
    assert(elecPromos.length === 3, "Category promo returns all 3 Electronics banners");
    assert(
      elecPromos.every((p) => p.targetCategory === "Electronics"),
      "Category isolation: zero Fashion banners leaked into Electronics query"
    );

    const emptyCategory = await getEligibleBanners({
      placement: "category_promo",
      category: "", // Empty category
      now,
    });
    assert(emptyCategory.length === 0, "Category promo requires non-empty category context");
  }

  // =========================================================================
  // TEST GROUP 6: Scheduled Transitions Without Deployment
  // =========================================================================
  console.log("\n--- 6. Zero-Deployment Scheduled Transition Tests ---");
  {
    await BannerModel.deleteMany({});
    const tStart = new Date("2026-10-22T15:00:00.000Z");

    const futureHero = await BannerModel.create({
      name: "Automatic Transition Hero",
      headline: "Automatic Transition Headline",
      imageUrl: "https://example.com/transition.jpg",
      imageAlt: "Transition",
      ctaLabel: "Explore",
      ctaUrl: "/explore",
      placement: "homepage_hero",
      status: "published",
      startAt: tStart,
      endAt: null,
      priority: 50,
      createdBy: adminUser._id.toString(),
      updatedBy: adminUser._id.toString(),
    });

    // Before schedule
    const clockBefore = new Date("2026-10-22T14:59:59.000Z");
    const beforeResult = await getEligibleBanners({
      placement: "homepage_hero",
      now: clockBefore,
    });
    assert(beforeResult.length === 0, "Banner is hidden before scheduled startAt arrives");

    // Advance clock past schedule without mutating the document
    const clockAfter = new Date("2026-10-22T15:00:01.000Z");
    const afterResult = await getEligibleBanners({
      placement: "homepage_hero",
      now: clockAfter,
    });
    assert(
      afterResult.length === 1 && afterResult[0]._id.toString() === futureHero._id.toString(),
      "Banner becomes eligible automatically at startAt with zero code deploy or status mutation"
    );
  }

  // =========================================================================
  // TEST GROUP 7: Security, Admin Auth & Forgery Rejection
  // =========================================================================
  console.log("\n--- 7. Security & Admin Authorization Tests ---");
  {
    // Unauthenticated GET
    const reqUnauth = new NextRequest("http://localhost:3000/api/admin/banners");
    const resUnauth = await getAdminBanners(reqUnauth);
    assert(resUnauth?.status === 401, "Unauthenticated request to /api/admin/banners is rejected (401)");

    // Forged non-admin GET
    const reqStudent = new NextRequest("http://localhost:3000/api/admin/banners", {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const resStudent = await getAdminBanners(reqStudent);
    assert(resStudent?.status === 403, "Non-admin user token is rejected from /api/admin/banners (403)");

    // Valid admin GET
    const reqAdmin = new NextRequest("http://localhost:3000/api/admin/banners", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const resAdmin = await getAdminBanners(reqAdmin);
    assert(resAdmin?.status === 200, "Valid admin token is granted access to /api/admin/banners (200)");
  }

  // =========================================================================
  // TEST GROUP 8: Input Validation & Dangerous CTA URLs
  // =========================================================================
  console.log("\n--- 8. Input Validation & Dangerous URL Rejection Tests ---");
  {
    assert(!isValidCtaUrl("javascript:alert(document.cookie)"), "Blocks javascript: scheme");
    assert(!isValidCtaUrl("data:text/html,<script>evil()</script>"), "Blocks data: scheme");
    assert(!isValidCtaUrl("vbscript:msgbox(1)"), "Blocks vbscript: scheme");
    assert(!isValidCtaUrl("//evil.com/phish"), "Blocks protocol-relative // URLs");
    assert(isValidCtaUrl("/explore?category=Books"), "Allows safe relative path");
    assert(isValidCtaUrl("https://campushive.edu.ng/deals"), "Allows safe https URL");

    // POST API level rejection
    const reqDangerous = new NextRequest("http://localhost:3000/api/admin/banners", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Malicious Banner",
        headline: "Free Giveaways",
        imageUrl: "https://example.com/banner.jpg",
        imageAlt: "Alt",
        ctaLabel: "Click Here",
        ctaUrl: "javascript:alert('XSS')", // Dangerous
        placement: "homepage_hero",
        status: "draft",
      }),
    });
    const resDangerous = await createAdminBanner(reqDangerous);
    assert(resDangerous?.status === 400, "POST /api/admin/banners rejects dangerous CTA URL (400)");
  }

  // =========================================================================
  // TEST GROUP 9: Image Upload Policy Verification
  // =========================================================================
  console.log("\n--- 9. Image Upload Policy Configuration Tests ---");
  {
    const bannerPolicy = UPLOAD_POLICIES["banner_image"];
    assert(bannerPolicy !== undefined, "banner_image is registered in UPLOAD_POLICIES");
    assert(
      bannerPolicy.allowedMimeTypes.includes("image/jpeg") &&
        bannerPolicy.allowedMimeTypes.includes("image/png") &&
        bannerPolicy.allowedMimeTypes.includes("image/webp"),
      "banner_image policy supports standard web image types"
    );
    assert(
      bannerPolicy.maxSizeBytes === 8 * 1024 * 1024,
      "banner_image policy enforces 8MB max upload size"
    );
    assert(
      bannerPolicy.folderPrefix === "campushive/banners",
      "banner_image policy isolates files in campushive/banners folder"
    );
  }

  // =========================================================================
  // TEST GROUP 10: Cache TTL Boundary Calculation
  // =========================================================================
  console.log("\n--- 10. Cache Boundary & Expiration Calculation Tests ---");
  {
    const now = new Date("2026-10-22T10:00:00.000Z");

    // 1. Clamped to nearest endAt
    const bannerWithNearEnd = {
      _id: "test",
      placement: "homepage_hero",
      status: "published",
      startAt: new Date("2026-10-22T09:00:00.000Z"),
      endAt: new Date("2026-10-22T10:00:25.000Z"), // 25 seconds remaining
      priority: 10,
    } as any;

    const ttl = await calculateNextScheduleTtl("homepage_hero", [bannerWithNearEnd], now, 60);
    assert(
      ttl === 25,
      `Cache TTL is accurately clamped to banner endAt (expected 25s, got ${ttl}s)`
    );
  }

  // =========================================================================
  // TEST GROUP 11: Audit Logging Verification on Transitions
  // =========================================================================
  console.log("\n--- 11. Append-Only Admin Audit Trail Tests ---");
  {
    await BannerModel.deleteMany({});
    const conn = mongoose.connection;
    const auditColl = conn.db!.collection("admin_audit_logs");
    await auditColl.deleteMany({ targetType: "banner" });

    // 1. Create Banner via POST API
    const createReq = new NextRequest("http://localhost:3000/api/admin/banners", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Audit Test Banner",
        headline: "Audit Headline",
        imageUrl: "https://example.com/audit.jpg",
        imageAlt: "Audit Alt",
        ctaLabel: "Shop",
        ctaUrl: "/explore",
        placement: "homepage_hero",
        status: "draft",
        priority: 10,
      }),
    });
    const createRes = await createAdminBanner(createReq);
    assert(createRes?.status === 201, "Banner created successfully via admin API (201)");
    const createdJson = await createRes!.json();
    const bannerId = createdJson.data.id;

    // Check create audit log
    const createAudit = await auditColl.findOne({
      targetType: "banner",
      targetId: bannerId,
      action: "create_banner",
    });
    assert(createAudit !== null, "Audit entry persisted for create_banner");
    assert(createAudit?.actorId === adminUser._id.toString(), "Audit logs exact actorId");

    // 2. Publish Banner via POST API
    const publishReq = new NextRequest(`http://localhost:3000/api/admin/banners/${bannerId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const publishRes = await publishBanner(publishReq, { params: Promise.resolve({ id: bannerId }) });
    assert(publishRes?.status === 200, "Banner published successfully (200)");

    const publishAudit = await auditColl.findOne({
      targetType: "banner",
      targetId: bannerId,
      action: "publish_banner",
    });
    assert(publishAudit !== null, "Audit entry persisted for publish_banner");

    // 3. Unpublish Banner via POST API
    const unpublishReq = new NextRequest(`http://localhost:3000/api/admin/banners/${bannerId}/unpublish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const unpublishRes = await unpublishBanner(unpublishReq, { params: Promise.resolve({ id: bannerId }) });
    assert(unpublishRes?.status === 200, "Banner unpublished successfully (200)");

    const unpublishAudit = await auditColl.findOne({
      targetType: "banner",
      targetId: bannerId,
      action: "unpublish_banner",
    });
    assert(unpublishAudit !== null, "Audit entry persisted for unpublish_banner");

    // 4. Archive Banner via POST API
    const archiveReq = new NextRequest(`http://localhost:3000/api/admin/banners/${bannerId}/archive`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const archiveRes = await archiveBanner(archiveReq, { params: Promise.resolve({ id: bannerId }) });
    assert(archiveRes?.status === 200, "Banner archived successfully (200)");

    const archiveAudit = await auditColl.findOne({
      targetType: "banner",
      targetId: bannerId,
      action: "archive_banner",
    });
    assert(archiveAudit !== null, "Audit entry persisted for archive_banner");
  }

  // =========================================================================
  // TEST GROUP 12: Public API Endpoint & Payload Filtering
  // =========================================================================
  console.log("\n--- 12. Public API (/api/banners/active) Tests ---");
  {
    await BannerModel.deleteMany({});
    const heroDoc = await BannerModel.create({
      name: "Public API Hero",
      headline: "Public API Headline",
      description: "Public Description",
      imageUrl: "https://example.com/pub.jpg",
      imageAlt: "Public Alt",
      ctaLabel: "Shop",
      ctaUrl: "/explore",
      placement: "homepage_hero",
      status: "published",
      startAt: new Date("2026-10-22T08:00:00.000Z"),
      endAt: null,
      priority: 50,
      createdBy: adminUser._id.toString(),
      updatedBy: adminUser._id.toString(),
    });

    const publicReq = new NextRequest("http://localhost:3000/api/banners/active?placement=homepage_hero");
    const publicRes = await getActiveBanners(publicReq);
    assert(publicRes?.status === 200, "GET /api/banners/active returns 200");
    const json = await publicRes!.json();
    assert(json.success === true && json.data !== null, "Returns eligible banner data");
    assert(json.data.headline === "Public API Headline", "Returns matching banner headline");
    assert(json.data.createdBy === undefined, "Internal createdBy field is strictly stripped from public DTO");
    assert(json.data.updatedBy === undefined, "Internal updatedBy field is strictly stripped from public DTO");
    assert(
      Boolean(publicRes?.headers.get("cache-control")?.includes("public")),
      "Applies public Cache-Control header"
    );
  }

  // Teardown
  await mongoose.disconnect();
  await repl.stop();

  console.log("\n==================================================================");
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
