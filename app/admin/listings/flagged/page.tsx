import { redirect } from "next/navigation";

export default function FlaggedListingsRedirect() {
  redirect("/admin/moderation?tab=pending");
}
