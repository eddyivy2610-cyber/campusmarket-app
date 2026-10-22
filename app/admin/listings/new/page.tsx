import { redirect } from "next/navigation";

export default function NewListingsRedirect() {
  redirect("/admin/moderation?tab=pending");
}
