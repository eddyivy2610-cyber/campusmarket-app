import { redirect } from "next/navigation";

export default function ResolvedReportsRedirect() {
  redirect("/admin/reports");
}
