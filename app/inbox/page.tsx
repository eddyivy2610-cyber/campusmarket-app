import { MessageSquare } from "lucide-react";
import { ChatSidebar } from "../components/chat/ChatSidebar";

export default function InboxPage() {
    return (
        <div className="h-full w-full">
            {/* Mobile View: Sidebar List */}
            <div className="md:hidden h-full w-full">
                <ChatSidebar />
            </div>

            {/* Desktop View: Empty State */}
            <div className="hidden md:flex flex-col items-center justify-center h-full w-full text-center p-8 space-y-4 opacity-70">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Select a conversation</h2>
                <p className="text-muted-foreground max-w-sm">
                    Choose from your existing conversations or start a new one to begin chatting.
                </p>
            </div>
        </div>
    );
}
