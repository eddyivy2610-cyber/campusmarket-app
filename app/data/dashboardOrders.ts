export type OrderStatus =
    | "Pending"
    | "Active"
    | "Completed"
    | "Failed"
    | "Cancelled"
    | "Pending Admin Verification";

export interface DashboardOrder {
    id: string;
    customer: string;
    buyerId: string;
    vendorId: string;
    listingId: number;
    productName: string;
    productImage: string;
    date: string; // MM/DD/YYYY
    amount: number;
    status: OrderStatus;
    qty: number;
    ratingLeft: boolean;
    ratingId?: string;
    sellerConfirmed: boolean;
    adminVerified: boolean;
    failureReason?: string;
    notes?: string;
    lastMessage?: string;
}

export const DASHBOARD_ORDERS: DashboardOrder[] = [
    {
        id: "#ORD-0810",
        customer: "Fola O",
        buyerId: "fola",
        vendorId: "vendor-1",
        listingId: 1,
        productName: "MacBook Air M1",
        productImage: "",
        date: "01/15/2025",
        amount: 520000,
        status: "Completed",
        qty: 1,
        ratingLeft: true,
        ratingId: "r1",
        sellerConfirmed: true,
        adminVerified: true
    },
    {
        id: "#ORD-0832",
        customer: "Hassan B",
        buyerId: "hassan",
        vendorId: "vendor-1",
        listingId: 2,
        productName: "Galaxy Watch",
        productImage: "",
        date: "03/02/2025",
        amount: 120000,
        status: "Active",
        qty: 1,
        ratingLeft: false,
        sellerConfirmed: false,
        adminVerified: false
    },
    {
        id: "#ORD-1024",
        customer: "Michael O.",
        buyerId: "michael",
        vendorId: "vendor-1",
        listingId: 1,
        productName: "Macbook Pro 2021",
        productImage: "",
        date: "03/21/2025",
        amount: 450000,
        status: "Pending Admin Verification",
        qty: 1,
        ratingLeft: true,
        ratingId: "r1",
        sellerConfirmed: true,
        adminVerified: false,
        lastMessage: "Item received! Leaving review now."
    },
    {
        id: "#ORD-1152",
        customer: "Tunde A",
        buyerId: "tunde",
        vendorId: "vendor-1",
        listingId: 3,
        productName: "PlayStation 5",
        productImage: "",
        date: "04/05/2026",
        amount: 950000,
        status: "Pending",
        qty: 1,
        ratingLeft: false,
        sellerConfirmed: false,
        adminVerified: false
    },
    {
        id: "#ORD-1410",
        customer: "Rita S",
        buyerId: "rita",
        vendorId: "vendor-1",
        listingId: 2,
        productName: "Round Neck T‑Shirt",
        productImage: "",
        date: "09/22/2026",
        amount: 52000,
        status: "Failed",
        qty: 1,
        ratingLeft: false,
        sellerConfirmed: false,
        adminVerified: false,
        failureReason: "Buyer canceled"
    },
];
