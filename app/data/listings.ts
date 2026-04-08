import { Product } from "./types";

export type ListingStatus = "active" | "sold" | "paused" | "pending";

export interface ListingRecord extends Product {
    listingCode: string;
    slug: string;
    status: ListingStatus;
    route: string;
    sellerName: string;
    sellerHandle: string;
    createdAt: string;
    updatedAt: string;
    inventory: number;
    fulfillment: {
        delivery: boolean;
        pickup: boolean;
        pickupLocation?: string;
    };
    paymentMethods: Array<"cash" | "transfer" | "card">;
    visibility: "public" | "campus-only";
    isFeatured: boolean;
}

export const LISTINGS_DB: ListingRecord[] = [];

export const getAllListings = () => LISTINGS_DB;
export const getListingById = (id: number) => LISTINGS_DB.find((listing) => listing.id === id);
export const getListingsBySellerId = (sellerId: string) => LISTINGS_DB.filter((listing) => listing.sellerId === sellerId);
