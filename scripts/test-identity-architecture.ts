/**
 * Comprehensive Unit Test for Campus Hive Public URL and Identity Architecture.
 * Verifies RFC 9562 UUIDv7 compliance, historical timestamps, entropy suffixes,
 * and slug preservation across edits.
 */

import { generateUUIDv7, isValidUUIDv7, extractUUIDv7Timestamp, deriveSlugSuffix } from "../app/lib/uuidv7";
import {
  normalizeToKebabCase,
  buildCanonicalSlug,
  createEntityIdentity,
  updateSlugPreservingSuffix,
  parseSlugWithSuffix,
  normalizeUsername,
  normalizeStoreSlug,
} from "../app/lib/slugUtils";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log("=== Testing Campus Hive Identity Architecture ===\n");

// 1. UUIDv7 Generation & Validation
const uuid1 = generateUUIDv7();
assert(isValidUUIDv7(uuid1), `Generated UUIDv7 is valid: ${uuid1}`);
assert(uuid1.charAt(14) === "7", "Version character is '7'");
assert(["8", "9", "a", "b"].includes(uuid1.charAt(19)), "Variant character is 8, 9, a, or b");

// 2. Historical Timestamp Support (for migration backfilling)
const historicalTime = new Date("2024-05-15T10:30:00Z").getTime();
const historicalUuid = generateUUIDv7(historicalTime);
assert(isValidUUIDv7(historicalUuid), "Historical UUIDv7 is valid");
const extractedTime = extractUUIDv7Timestamp(historicalUuid);
assert(extractedTime === historicalTime, `Extracted timestamp (${extractedTime}) matches historical input (${historicalTime})`);

// 3. Collision Resistance in Same Millisecond
const count = 5000;
const set = new Set<string>();
const suffixSet = new Set<string>();
const fixedMs = Date.now();

for (let i = 0; i < count; i++) {
  const u = generateUUIDv7(fixedMs);
  set.add(u);
  suffixSet.add(deriveSlugSuffix(u));
}
assert(set.size === count, `Zero UUID collisions across ${count} generations at identical timestamp`);
assert(suffixSet.size === count, `Zero suffix collisions across ${count} generations at identical timestamp`);

// 4. Slug Normalization with Accents and Punctuation
const dirtyTitle = "Café & Crêpes: Student's #1 Choice in Zaria!";
const cleanKebab = normalizeToKebabCase(dirtyTitle);
assert(cleanKebab === "cafe-crepes-students-1-choice-in-zaria", `Kebab normalization stripped accents & punctuation: '${cleanKebab}'`);

// 5. Complete Identity Stack Creation
const identity = createEntityIdentity("MacBook Pro 16-inch M3 Max");
assert(isValidUUIDv7(identity.publicId), "Identity publicId is valid UUIDv7");
assert(identity.slugSuffix.length === 8, "Suffix is 8 chars");
assert(identity.slug.endsWith(`-${identity.slugSuffix}`), "Slug correctly embeds suffix");
assert(identity.slug.startsWith("macbook-pro-16-inch-m3-max"), "Slug contains normalized title");

// 6. Title Change Preserving Stable Suffix
const updatedTitle = "MacBook Pro 16-inch M3 Max (32GB RAM / 1TB SSD)";
const updatedSlug = updateSlugPreservingSuffix(updatedTitle, identity.slugSuffix);
assert(updatedSlug.endsWith(`-${identity.slugSuffix}`), "Updated slug preserves original stable suffix");
assert(updatedSlug !== identity.slug, "Descriptive slug successfully adapted to new title");

// 7. Parse Slug With Suffix
const parsed = parseSlugWithSuffix(updatedSlug);
assert(parsed.isSuffixed === true, "Parser recognizes suffix");
assert(parsed.suffix === identity.slugSuffix, "Extracted suffix matches original");
assert(parsed.descriptive.startsWith("macbook-pro-16-inch"), "Extracted descriptive part matches");

// 8. Username & Store Slug Normalization
const userHandle = normalizeUsername("@Lucky_John.2026!");
assert(userHandle === "lucky_john2026", `Username normalization: '${userHandle}'`);

const storeSlug = normalizeStoreSlug("Graceful Expression & Artz Store");
assert(storeSlug === "graceful-expression-artz-store", `Store slug normalization: '${storeSlug}'`);

console.log("\n✨ All identity architecture foundation tests PASSED successfully!");
