import { ChatInterface } from "../../components/chat/ChatInterface";

export default function InboxDatePage({ params }: { params: { id: string } }) {
    return <ChatInterface chatId={params.id} />;
}
