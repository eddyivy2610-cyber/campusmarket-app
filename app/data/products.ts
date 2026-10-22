/**
 * @BACKEND: MOCK DATA — This entire file contains hardcoded product data used for prototyping.
 *
 * Replace with:
 *   - GET /api/products            → fetch all products (with pagination, filters, sorting)
 *   - GET /api/products/:id        → fetch single product by ID
 *   - POST /api/products           → create new product listing
 *   - PUT /api/products/:id        → update an existing product
 *   - DELETE /api/products/:id     → delete a product listing
 *   - GET /api/products/:id/reviews → fetch reviews for a product
 *   - POST /api/products/:id/reviews → submit a review
 *
 * The Product and Review interfaces below can be reused as response types.
 * Image URLs should come from a file storage service (e.g. S3, Cloudinary).
 */

import { LISTINGS_DB } from "./listings";
import type { Product } from "./types";
export type { Review, Product } from "./types";

export const CATEGORIES: { name: string; icon: string; lucideIcon: string; href?: string }[] = [
    { name: "Electronics", icon: "📱", lucideIcon: "MonitorSmartphone" },
    { name: "Academics", icon: "📚", lucideIcon: "BookOpen" },
    { name: "Accomodation", icon: "🏠", lucideIcon: "Home" },
    { name: "Food & Provisions", icon: "🍔", lucideIcon: "UtensilsCrossed" },
    { name: "Fashion", icon: "👕", lucideIcon: "Shirt" },
    { name: "Personal Care", icon: "✨", lucideIcon: "Sparkles" },
    { name: "Sports & Fitness", icon: "🏋️‍♂️", lucideIcon: "Dumbbell" },
    { name: "Entertainment", icon: "🎸", lucideIcon: "Music" },

    { name: "Transport", icon: "🚲", lucideIcon: "Bike" },
    { name: "Services", icon: "🛠️", lucideIcon: "Wrench", href: "/services" }
];

export const PRODUCTS: Product[] = LISTINGS_DB;
