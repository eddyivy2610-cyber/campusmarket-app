import React, { Suspense } from "react";
import { CreateListingForm } from "../../components/listings/CreateListingForm";

export const metadata = {
  title: "Create Listing — Campus Hive",
  description: "Post a product or service for students and verified buyers on campus.",
};

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1015]">
          <div className="w-8 h-8 rounded-full border-2 border-[#171717] dark:border-white border-t-transparent animate-spin" />
        </div>
      }
    >
      <CreateListingForm />
    </Suspense>
  );
}
