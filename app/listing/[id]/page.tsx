import { redirect } from "next/navigation";

export default async function LegacyListingRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/listings/${encodeURIComponent(id)}`);
}
