/**
 * Test Suite: App Preference Settings for Campus Hive 2.0 MVP
 *
 * Verifies:
 * 1. GET /api/users/preferences returns complete default settings for new users.
 * 2. Unauthenticated calls return 401 Unauthorized.
 * 3. PATCH updates appearance settings (theme, accent color, text size, density).
 * 4. PATCH updates discovery preferences (default landing, categories, sorting, campus, price range).
 * 5. PATCH updates notification preferences (messages, orders, followed stores, wishlist, promotions).
 * 6. PATCH updates privacy & trust preferences (visibility, online status, sales milestone toggle, messaging permissions).
 * 7. PATCH updates messaging preferences (previews, read receipts, contact channel).
 * 8. PATCH updates accessibility & data usage (reduced motion, high contrast, data saver).
 * 9. Mass Assignment Guard: Rejects privileged fields (role, accountStatus, tokenVersion, _id) with 400.
 * 10. Seller Isolation: Non-sellers attempting to update seller preferences are rejected with 403.
 * 11. Seller Settings: Legitimate sellers can update vacation mode, inquiry alerts, and auto-reply.
 * 12. Partial Subdocument Updates: Sibling preference keys are preserved during selective updates.
 * 13. Privacy Flag Persistence: Sales milestone preference persists in User document.
 * 14. Notification Service Integration: Suppresses muted notification categories based on user preferences.
 */

import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import dbConnect from "../app/lib/dbConnect";
import UserModel, { DEFAULT_USER_PREFERENCES } from "../app/models/User";
import { GET, PATCH } from "../app/api/users/preferences/route";
import { createNotification } from "../app/lib/notificationService";
import { createAccessToken } from "../app/lib/authTokens";

interface TestStats {
  passed: number;
  failed: number;
  total: number;
}

const stats: TestStats = { passed: 0, failed: 0, total: 0 };

function assert(condition: boolean, testName: string, detail?: string) {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  [#${stats.total}] PASS: ${testName}`);
  } else {
    stats.failed++;
    console.error(`  [#${stats.total}] FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
  }
}

function makeAuthedRequest(
  url: string,
  method: string,
  token?: string,
  body?: any
): NextRequest {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Cookie", `auth_token=${token}`);
  }

  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  return new NextRequest(fullUrl, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function runPreferencesTestSuite() {
  console.log("===============================================================================");
  console.log("   CAMPUS HIVE 2.0: USER APP PREFERENCES SETTINGS VERIFICATION SUITE           ");
  console.log("===============================================================================\n");

  let mongod: MongoMemoryReplSet | null = null;
  process.env.AUTH_SECRET = "test_super_secret_jwt_key_with_at_least_32_characters_for_hmac!";

  try {
    mongod = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    process.env.MONGODB_URI = mongod.getUri();

    await dbConnect();

    // Test Fixtures
    const buyerEmail = `pref_buyer_${Date.now()}@campus.edu.ng`;
    const sellerEmail = `pref_seller_${Date.now()}@campus.edu.ng`;

    const buyerUser = await UserModel.create({
      name: "Amina Lawal",
      email: buyerEmail,
      role: "buyer",
      accountStatus: "active",
      campus: "Ahmadu Bello University",
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const sellerUser = await UserModel.create({
      name: "Emeka Okonkwo",
      email: sellerEmail,
      role: "seller",
      accountStatus: "active",
      campus: "University of Lagos",
      isStudent: true,
      studentVerified: true,
      tokenVersion: 0,
      schemaVersion: 1,
    });

    const buyerToken = createAccessToken({
      id: buyerUser._id.toString(),
      name: buyerUser.name,
      email: buyerUser.email,
      role: "buyer",
      isStudent: true,
      studentVerified: true,
      campus: buyerUser.campus,
      tokenVersion: 0,
    });

    const sellerToken = createAccessToken({
      id: sellerUser._id.toString(),
      name: sellerUser.name,
      email: sellerUser.email,
      role: "seller",
      isStudent: true,
      studentVerified: true,
      campus: sellerUser.campus,
      tokenVersion: 0,
    });

    // 1. Unauthenticated GET returns 401
    const unauthedReq = makeAuthedRequest("/api/users/preferences", "GET");
    const unauthedRes = await GET(unauthedReq);
    assert(
      unauthedRes.status === 401,
      "Unauthenticated GET /api/users/preferences returns 401 Unauthorized"
    );

    // 2. Authenticated GET returns 200 and defaults
    const getReq = makeAuthedRequest("/api/users/preferences", "GET", buyerToken);
    const getRes = await GET(getReq);
    const getData = await getRes.json();
    assert(
      getRes.status === 200 && getData.success === true,
      "Authenticated GET /api/users/preferences returns 200 Success"
    );
    assert(
      getData.data.appearance.theme === "system" &&
        getData.data.appearance.accentColor === "amber" &&
        getData.data.appearance.textSize === "normal" &&
        getData.data.appearance.displayDensity === "comfortable",
      "GET returns default Appearance settings"
    );
    assert(
      getData.data.discovery.defaultLanding === "explore" &&
        getData.data.discovery.defaultSort === "recent" &&
        Array.isArray(getData.data.discovery.preferredCategories),
      "GET returns default Discovery settings"
    );
    assert(
      getData.data.notifications.messages === true &&
        getData.data.notifications.orderUpdates === true &&
        getData.data.notifications.promotions === false,
      "GET returns default Notification toggles"
    );
    assert(
      getData.data.privacy.profileVisibility === "public" &&
        getData.data.privacy.showOnlineStatus === true &&
        getData.data.privacy.showSalesMilestones === true,
      "GET returns default Privacy & Trust settings"
    );
    assert(
      getData.isSeller === false,
      "GET correctly identifies buyer as non-seller (isSeller = false)"
    );

    // 3. PATCH Appearance settings
    const patchApprReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        appearance: {
          theme: "dark",
          accentColor: "emerald",
          textSize: "compact",
          displayDensity: "compact",
        },
      }
    );
    const patchApprRes = await PATCH(patchApprReq);
    const patchApprData = await patchApprRes.json();
    assert(
      patchApprRes.status === 200 &&
        patchApprData.data.appearance.theme === "dark" &&
        patchApprData.data.appearance.accentColor === "emerald" &&
        patchApprData.data.appearance.textSize === "compact" &&
        patchApprData.data.appearance.displayDensity === "compact",
      "PATCH updates Appearance settings (theme: dark, accentColor: emerald, textSize: compact, density: compact)"
    );

    // 4. PATCH Discovery settings
    const patchDiscReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        discovery: {
          defaultLanding: "radar",
          defaultSort: "popular",
          preferredCampus: "Samaru Campus, ABU Zaria",
          preferredCategories: ["Textbooks & Academic", "Laptops & Tech Gear"],
          priceRange: { min: 1000, max: 50000 },
        },
      }
    );
    const patchDiscRes = await PATCH(patchDiscReq);
    const patchDiscData = await patchDiscRes.json();
    assert(
      patchDiscRes.status === 200 &&
        patchDiscData.data.discovery.defaultLanding === "radar" &&
        patchDiscData.data.discovery.defaultSort === "popular" &&
        patchDiscData.data.discovery.preferredCategories.length === 2 &&
        patchDiscData.data.discovery.priceRange.min === 1000 &&
        patchDiscData.data.discovery.priceRange.max === 50000,
      "PATCH updates Discovery settings (landing: radar, sort: popular, priceRange: 1k-50k)"
    );

    // 5. PATCH Notifications settings
    const patchNotifReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        notifications: {
          messages: false, // Mute message alerts
          followedStores: false,
          promotions: true,
        },
      }
    );
    const patchNotifRes = await PATCH(patchNotifReq);
    const patchNotifData = await patchNotifRes.json();
    assert(
      patchNotifRes.status === 200 &&
        patchNotifData.data.notifications.messages === false &&
        patchNotifData.data.notifications.followedStores === false &&
        patchNotifData.data.notifications.promotions === true &&
        patchNotifData.data.notifications.orderUpdates === true, // untouched sibling
      "PATCH updates Notification toggles and preserves untouched sibling toggles"
    );

    // 6. PATCH Privacy & Trust settings
    const patchPrivReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        privacy: {
          profileVisibility: "campus_only",
          showOnlineStatus: false,
          showSalesMilestones: false,
          messagePermission: "verified",
        },
      }
    );
    const patchPrivRes = await PATCH(patchPrivReq);
    const patchPrivData = await patchPrivRes.json();
    assert(
      patchPrivRes.status === 200 &&
        patchPrivData.data.privacy.profileVisibility === "campus_only" &&
        patchPrivData.data.privacy.showOnlineStatus === false &&
        patchPrivData.data.privacy.showSalesMilestones === false &&
        patchPrivData.data.privacy.messagePermission === "verified",
      "PATCH updates Privacy & Trust settings (campus_only, online hidden, milestone private)"
    );

    // 7. Verify Privacy Flag Persistence in MongoDB
    const persistedUser = await UserModel.findById(buyerUser._id).lean();
    assert(
      persistedUser?.preferences?.privacy?.showSalesMilestones === false &&
        persistedUser?.preferences?.privacy?.showOnlineStatus === false,
      "Privacy flags persist deterministically in MongoDB user document"
    );

    // 8. PATCH Messaging settings
    const patchMsgReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        messaging: {
          messagePreviews: false,
          readReceipts: false,
          contactChannel: "whatsapp",
        },
      }
    );
    const patchMsgRes = await PATCH(patchMsgReq);
    const patchMsgData = await patchMsgRes.json();
    assert(
      patchMsgRes.status === 200 &&
        patchMsgData.data.messaging.messagePreviews === false &&
        patchMsgData.data.messaging.readReceipts === false &&
        patchMsgData.data.messaging.contactChannel === "whatsapp",
      "PATCH updates Messaging preferences (previews off, receipts off, whatsapp channel)"
    );

    // 9. PATCH Accessibility & Data Saver
    const patchAccessReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        accessibility: {
          reduceMotion: true,
          highContrast: true,
          dataSaver: true,
        },
      }
    );
    const patchAccessRes = await PATCH(patchAccessReq);
    const patchAccessData = await patchAccessRes.json();
    assert(
      patchAccessRes.status === 200 &&
        patchAccessData.data.accessibility.reduceMotion === true &&
        patchAccessData.data.accessibility.highContrast === true &&
        patchAccessData.data.accessibility.dataSaver === true,
      "PATCH updates Accessibility & Data Saver (reduceMotion: true, highContrast: true, dataSaver: true)"
    );

    // 10. Mass Assignment Guard: Rejects privileged fields with 400 Bad Request
    const massAssignReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        role: "admin",
        accountStatus: "suspended",
        tokenVersion: 999,
        appearance: { theme: "light" },
      }
    );
    const massAssignRes = await PATCH(massAssignReq);
    assert(
      massAssignRes.status === 400,
      "Mass Assignment Guard: Request with disallowed root fields rejected with 400 Bad Request"
    );

    const checkSecurityUser = await UserModel.findById(buyerUser._id).lean();
    assert(
      checkSecurityUser?.role === "buyer" &&
        checkSecurityUser?.accountStatus === "active" &&
        checkSecurityUser?.tokenVersion === 0,
      "Security Verification: Privileged fields remained unmutated in database"
    );

    // 11. Seller Isolation: Non-seller attempting to set seller preferences rejected with 403
    const buyerSellerPrefReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        seller: {
          vacationMode: true,
          autoReply: "Hacked vacation message",
        },
      }
    );
    const buyerSellerPrefRes = await PATCH(buyerSellerPrefReq);
    assert(
      buyerSellerPrefRes.status === 403,
      "Seller Isolation: Non-seller modifying seller preferences receives 403 Forbidden"
    );

    // 12. Seller Preference Update: Eligible seller can set vacation mode & autoReply
    const sellerPrefReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      sellerToken,
      {
        seller: {
          vacationMode: true,
          inquiryAlerts: true,
          autoReply: "Thanks for checking my campus store! Back on campus Monday.",
        },
      }
    );
    const sellerPrefRes = await PATCH(sellerPrefReq);
    const sellerPrefData = await sellerPrefRes.json();
    assert(
      sellerPrefRes.status === 200 &&
        sellerPrefData.data.seller.vacationMode === true &&
        sellerPrefData.data.seller.autoReply.includes("Back on campus Monday"),
      "Seller Settings: Eligible seller successfully updates vacation mode and auto-reply"
    );

    // 13. Sibling Preservations Across Partial Patch
    const siblingCheckReq = makeAuthedRequest(
      "/api/users/preferences",
      "PATCH",
      buyerToken,
      {
        appearance: {
          accentColor: "sky",
        },
      }
    );
    const siblingCheckRes = await PATCH(siblingCheckReq);
    const siblingCheckData = await siblingCheckRes.json();
    assert(
      siblingCheckRes.status === 200 &&
        siblingCheckData.data.appearance.accentColor === "sky" &&
        siblingCheckData.data.appearance.theme === "dark" && // preserved previous theme!
        siblingCheckData.data.appearance.textSize === "compact", // preserved previous text size!
      "Partial Patch: Sibling properties (theme, textSize) preserved when updating single field"
    );

    // 14. Notification Service Integration: Suppresses muted notification categories
    // Remember buyer turned off 'messages' and 'followedStores' earlier
    const mutedMessageNotif = await createNotification({
      recipient: buyerUser._id.toString(),
      type: "new_message",
      category: "messages",
      title: "New Chat",
      message: "Hey, is the laptop still available?",
    });
    assert(
      mutedMessageNotif === null,
      "Notification Service: Muted notification category ('messages') suppressed for recipient"
    );

    // But essential / active category like 'orders' should still deliver:
    const activeOrderNotif = await createNotification({
      recipient: buyerUser._id.toString(),
      type: "order_update",
      category: "orders",
      title: "Order Confirmed",
      message: "Your textbook deal has been confirmed.",
    });
    assert(
      activeOrderNotif !== null && activeOrderNotif.title === "Order Confirmed",
      "Notification Service: Active notification category ('orders') delivered successfully"
    );

    // Cleanup
    await UserModel.deleteMany({
      _id: { $in: [buyerUser._id, sellerUser._id] },
    });
  } catch (err: any) {
    console.error("Test Suite Execution Exception:", err);
    stats.failed++;
  } finally {
    if (mongod) {
      await mongoose.disconnect();
      await mongod.stop();
    }
  }

  console.log("\n===============================================================================");
  console.log(
    `   RESULTS: ${stats.passed}/${stats.total} ASSERTIONS PASSED (${stats.failed} FAILED)`
  );
  console.log("===============================================================================\n");

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runPreferencesTestSuite()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
