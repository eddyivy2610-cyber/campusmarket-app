
import { Package, MessageSquare, Sparkles, Heart, CreditCard, Truck, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

export type NotificationType = "order" | "message" | "update" | "saved" | "security" | "payment" | "promo";

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

export const mockNotifications: Notification[] = [
    // 1. Order & Transaction (High Priority)
    {
        id: 1,
        type: "order",
        title: "Order Confirmed",
        message: "Your order #2938 has been successfully placed.",
        alt: "Thanks for your purchase! Your order is being processed.",
        timestamp: "5 mins ago",
        exactTime: "Today 2:30pm",
        isRead: false,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=150",
        category: "orders",
        actions: ["View Order"],
        priority: "high"
    },
    {
        id: 2,
        type: "payment",
        title: "Payment Successful",
        message: "Your payment of ₦45,000 for 'Sony Headphones' was completed.",
        alt: "Payment received. Your order is now being prepared.",
        timestamp: "10 mins ago",
        exactTime: "Today 2:25pm",
        isRead: false,
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=150",
        category: "orders",
        priority: "high"
    },

    // 2. Messages
    {
        id: 3,
        type: "message",
        title: "New Message",
        message: "David: 'Is the Abstract Art Canvas still available available?'",
        alt: "A buyer has contacted you.",
        timestamp: "1 hour ago",
        exactTime: "Today 1:15pm",
        isRead: false,
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150", // User avatar or Item
        category: "messages",
        actions: ["Reply"]
    },

    // 3. Saved Items (Conversion)
    {
        id: 4,
        type: "saved",
        title: "Price Drop",
        message: "An item in your saved list 'Canon EOS M50' is now cheaper.",
        alt: "Good news! Price reduced on a saved item.",
        timestamp: "3 hours ago",
        exactTime: "Today 11:00am",
        isRead: true,
        image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=150",
        category: "saved",
        actions: ["View Listing"]
    },

    // 4. Updates / Features
    {
        id: 5,
        type: "update",
        title: "New Feature",
        message: "You can now boost your listings for 24 hours!",
        alt: "Try out our new boosting feature to reach more buyers.",
        timestamp: "1 day ago",
        exactTime: "Yesterday",
        isRead: true,
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=150",
        category: "updates",
        actions: ["Try it now"]
    },

    // 5. Security
    {
        id: 6,
        type: "security",
        title: "New Login Detected",
        message: "Your account was accessed from a new device (iPhone 13).",
        alt: "A new login was detected. Was this you?",
        timestamp: "2 days ago",
        exactTime: "Monday",
        isRead: true,
        category: "security",
        actions: ["Review Activity"]
    },

    // 6. Old Order
    {
        id: 7,
        type: "order",
        title: "Order Delivered",
        message: "Your order 'Calculus Textbook' has been delivered. Enjoy!",
        alt: "Delivery completed. We hope you love it.",
        timestamp: "3 days ago",
        exactTime: "Sunday",
        isRead: true,
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=150",
        category: "orders",
        actions: ["Leave Review"]
    }
];
