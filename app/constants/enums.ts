/**
 * Canonical System Enums for Campus Hive
 * Shared source of truth across Next.js and Express backend.
 */

// Listing Status Enums
export const LISTING_STATUSES = [
  "active",
  "draft",
  "pending_review",
  "paused",
  "sold",
  "rejected",
  "removed",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

// Product Condition Enums
export const PRODUCT_CONDITIONS = [
  "Brand New",
  "Like New",
  "Used - Excellent",
  "Used - Good",
  "Used - Fair",
] as const;
export type ProductCondition = (typeof PRODUCT_CONDITIONS)[number];

// Listing Type Enums
export const LISTING_TYPES = ["product", "service"] as const;
export type ListingType = (typeof LISTING_TYPES)[number];

// Service Pricing Model Enums
export const SERVICE_PRICING_MODELS = [
  "fixed",
  "hourly",
  "negotiable",
  "starting_at",
] as const;
export type ServicePricingModel = (typeof SERVICE_PRICING_MODELS)[number];

// Service Location Type Enums
export const SERVICE_LOCATION_TYPES = [
  "on_campus",
  "remote",
  "client_location",
  "vendor_shop",
] as const;
export type ServiceLocationType = (typeof SERVICE_LOCATION_TYPES)[number];

// Listing Cascade Markers
export const LISTING_PAUSED_BY_REASONS = [
  "seller",
  "account_suspension",
  "store_suspension",
] as const;
export type ListingPausedBy = (typeof LISTING_PAUSED_BY_REASONS)[number];

export const LISTING_REMOVED_BY_REASONS = [
  "seller",
  "account_ban",
  "admin",
] as const;
export type ListingRemovedBy = (typeof LISTING_REMOVED_BY_REASONS)[number];

// User Account Status Enums
export const USER_ACCOUNT_STATUSES = [
  "active",
  "suspended",
  "banned",
  "pending",
] as const;
export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

// User Role Enums
export const USER_ROLES = ["buyer", "seller", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Store Status Enums
export const STORE_STATUSES = [
  "active",
  "pending_review",
  "rejected",
  "suspended",
  "paused",
] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

// Store Suspension Markers
export const STORE_SUSPENDED_BY_REASONS = [
  "account_suspension",
  "store_suspension",
  "admin",
  "account_ban",
] as const;
export type StoreSuspendedBy = (typeof STORE_SUSPENDED_BY_REASONS)[number];

// Order Status & Coordination Enums (Non-custodial student marketplace)
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "disputed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_FULFILLMENT_METHODS = ["pickup", "delivery"] as const;
export type OrderFulfillmentMethod = (typeof ORDER_FULFILLMENT_METHODS)[number];

export const ORDER_PAYMENT_METHODS = ["cash", "transfer", "card"] as const;
export type OrderPaymentMethod = (typeof ORDER_PAYMENT_METHODS)[number];
