import { redirect } from "next/navigation";

/**
 * Legacy 1.0 listings admin page.
 * Consolidated into Campus Hive 2.0 Listing Moderation suite.
 */
export default function LegacyListingsRedirect() {
  redirect("/admin/moderation");
}
