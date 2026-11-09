import { redirect } from "next/navigation";

export default function PendingReportsRedirect() {
  redirect("/admin/reports");
}
