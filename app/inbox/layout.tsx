import { ChatSidebar } from "../components/chat/ChatSidebar";

export default function InboxLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full bg-secondary dark:bg-background flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full h-full max-w-[1600px] bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex">
                {/* 
                    Desktop Sidebar: Visible on md+ screens. Fixed width.
                */}
                <aside className="hidden md:flex w-80 lg:w-96 flex-col border-r border-border h-full bg-card">
                    <ChatSidebar />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 h-full relative flex flex-col min-w-0 bg-card">
                    {children}
                </main>
            </div>
        </div>
    );
}
