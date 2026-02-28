/**
 * @BACKEND: PROFILE PAGE — Currently redirects to a static route.
 *
 * Replace with:
 *   - GET /api/users/me → fetch authenticated user's profile
 *   - Render the profile page with real user data
 *   - If not authenticated, redirect to /login
 */

import { redirect } from "next/navigation";

export default function ProfileRedirect() {
    /* @BACKEND: Replace this redirect with actual profile rendering using authenticated user data */
    redirect("/profile/campus-market");
}
