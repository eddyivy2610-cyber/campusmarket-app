"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PublicStorefrontView } from "@/components/storefront/PublicStorefrontView";

export default function ProfileHandlePage() {
  const params = useParams();
  const rawParam = params?.handle;
  const rawHandle =
    typeof rawParam === "string"
      ? rawParam
      : Array.isArray(rawParam)
      ? rawParam[0]
      : "";
  const cleanHandle = decodeURIComponent(rawHandle || "")
    .replace(/^@/, "")
    .trim();

  return <PublicStorefrontView slug={cleanHandle || "me"} />;
}
