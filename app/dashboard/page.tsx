import { redirect } from "next/navigation";

export default function DashboardOverviewRedirect() {
  redirect("/stores?view=storefront");
}
