import React from "react";
import { StorefrontProfileView } from "@/components/storefront/StorefrontProfileView";

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StorefrontProfileView slug={slug} />;
}
