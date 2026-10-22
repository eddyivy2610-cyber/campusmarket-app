import React from "react";
import { CreateListingForm } from "../../../components/listings/CreateListingForm";

export const metadata = {
  title: "Create Listing — Campus Hive",
  description: "Create and publish a listing to sell across your campus.",
};

export default function DashboardAddProductPage() {
  return <CreateListingForm />;
}
