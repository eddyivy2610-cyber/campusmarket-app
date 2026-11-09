import { notFound } from "next/navigation";

/**
 * Public user profile pages (/profile/[handle]) are removed by product policy.
 * User accounts are private identities; only stores have public URLs (/store/[slug]).
 * Owner private account view is located at /profile (authenticated only).
 */
export default function PublicUserProfileDisabledPage() {
  notFound();
}
