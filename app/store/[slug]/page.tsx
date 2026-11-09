import React from "react";
import { PublicStorefrontView } from "@/components/storefront/PublicStorefrontView";

export default async function CanonicalStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicStorefrontView slug={slug} />;
}
