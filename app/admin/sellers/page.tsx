import { redirect } from "next/navigation";

/**
 * Legacy 1.0 seller approvals page.
 * Consolidated into Campus Hive 2.0 Business Applications queue.
 */
export default function LegacySellersRedirect() {
  redirect("/admin/business-applications");
}
