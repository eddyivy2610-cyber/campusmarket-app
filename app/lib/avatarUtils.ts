/**
 * Deterministic privacy-preserving fallback avatar URL helper.
 * Hashes user handles / IDs locally so raw student identifiers are never sent
 * in third-party avatar request URLs, while keeping avatars consistent across pages.
 */
export function hashAvatarSeed(rawSeed?: string | null): string {
  const normalized = (rawSeed || "student").trim().replace(/^@/, "").toLowerCase() || "student";
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  const input = `campushive-avatar-v1:${normalized}`;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const part1 = (h1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (h2 >>> 0).toString(16).padStart(8, "0");
  return `${part1}${part2}`;
}

export function getDefaultAvatarUrl(rawSeed?: string | null): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${hashAvatarSeed(rawSeed)}`;
}
