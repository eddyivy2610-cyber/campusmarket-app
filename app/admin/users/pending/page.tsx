import { redirect } from "next/navigation";

export default function PendingUsersRedirect() {
  redirect("/admin/users");
}
