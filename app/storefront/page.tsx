import React from "react";
import { redirect } from "next/navigation";

export default function StorefrontIndexPage() {
  redirect("/stores?view=storefront");
}
