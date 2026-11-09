import { redirect } from "next/navigation";

export default function InReviewReportsRedirect() {
  redirect("/admin/reports");
}
