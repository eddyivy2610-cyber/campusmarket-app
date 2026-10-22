import { redirect } from "next/navigation";

export default function SellersUsersRedirect() {
  redirect("/admin/users");
}
