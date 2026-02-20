import { redirect } from "next/navigation";

/**
 * /messages → redirect to /chat (inbox only, no thread selected)
 */
export default function MessagesPage() {
    redirect("/chat");
}
