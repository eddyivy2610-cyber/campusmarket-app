import { NotificationType } from "@/components/notifications/NotificationItem";

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    alt?: string;
    timestamp: string;
    exactTime: string;
    isRead: boolean;
    image?: string;
    category: "orders" | "messages" | "updates" | "saved" | "security";
    actions?: string[];
    priority?: "high" | "normal";
}

// Mock notifications are intentionally cleared.
export const mockNotifications: Notification[] = [];
