/**
 * CAMPUS HIVE 2.0 — MVP FEATURE FLAGS & CAMPUS DIRECTORY
 *
 * Non-MVP features per PRD Section 10.2 & Section 4.9 are frozen (set to false)
 * rather than deleted, so their code remains intact for Phase 5+ activation.
 */

export const MVP_FEATURE_FLAGS = {
  // Active MVP Features (PRD 10.1)
  CAMPUS_SELECTOR_AND_LANDMARKS: true,
  WANTED_REQUESTS_REVERSE_MARKETPLACE: true,
  STUDENT_AND_BUSINESS_STOREFRONTS: true,
  DISTINCT_VERIFICATION_BADGES: true,
  REGULAR_STUDENT_SELLING_ALLOWED: true,
  DIRECT_MESSAGING_AND_PRICE_OFFERS: true,

  // Frozen Non-MVP Features (PRD 4.9 & 10.2 — Preserved for Phase 5)
  UNRESTRICTED_STAR_RATINGS: false,
  COURIER_PACKAGE_DELIVERY: false,
  INTEGRATED_CHECKOUT_ORDERS: false,
  ESCROW_DISPUTE_CENTER: false,
  PAID_PROMOTIONS_AND_PRO_SUBSCRIPTIONS: false,
} as const;

export interface CampusLandmark {
  id: string;
  name: string;
  areaDescription: string;
}

export interface CampusConfig {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  universityName: string;
  universityShortName: string;
  isDefault?: boolean;
  landmarks: CampusLandmark[];
}

export const SUPPORTED_CAMPUSES: CampusConfig[] = [
  {
    id: "camp-abu-samaru",
    slug: "abu-zaria-samaru",
    name: "ABU Zaria — Samaru Campus",
    shortName: "ABU Samaru",
    universityName: "Ahmadu Bello University, Zaria",
    universityShortName: "ABU Zaria",
    isDefault: true,
    landmarks: [
      {
        id: "lm-kil",
        name: "Kashim Ibrahim Library (KIL) Entrance",
        areaDescription: "Central academic hub front walkway",
      },
      {
        id: "lm-main-gate",
        name: "Samaru Main Gate",
        areaDescription: "Main security plaza & pedestrian turnstile",
      },
      {
        id: "lm-eng",
        name: "Faculty of Engineering Complex",
        areaDescription: "Near Chemical & Electrical Engineering foyer",
      },
      {
        id: "lm-sub",
        name: "Student Social Centre / SUB",
        areaDescription: "Student Union commercial concourse",
      },
      {
        id: "lm-hostel",
        name: "Suleiman & Ribadu Hostel Common Area",
        areaDescription: "Designated public courtyard (no private rooms)",
      },
      {
        id: "lm-phase2",
        name: "Phase II Lecture Theatre Concourse",
        areaDescription: "Faculty of Science & Computer Science walkway",
      },
    ],
  },
  {
    id: "camp-abu-kongo",
    slug: "abu-zaria-kongo",
    name: "ABU Zaria — Kongo Campus",
    shortName: "ABU Kongo",
    universityName: "Ahmadu Bello University, Zaria",
    universityShortName: "ABU Zaria",
    landmarks: [
      {
        id: "lm-kongo-gate",
        name: "Kongo Main Gate",
        areaDescription: "Main Kongo campus entrance plaza",
      },
      {
        id: "lm-law",
        name: "Faculty of Law Quadrangle",
        areaDescription: "Law library & lecture hall foyer",
      },
      {
        id: "lm-admin",
        name: "Faculty of Administration Foyer",
        areaDescription: "Business Administration & Accounting walkway",
      },
    ],
  },
  {
    id: "camp-buk-kano",
    slug: "buk-kano-new",
    name: "BUK Kano — New Site (Pilot)",
    shortName: "BUK Kano",
    universityName: "Bayero University, Kano",
    universityShortName: "BUK",
    landmarks: [
      {
        id: "lm-buk-gate",
        name: "BUK New Site Main Gate",
        areaDescription: "Gwarzo Road main entrance",
      },
      {
        id: "lm-buk-sub",
        name: "Student Centre Concourse",
        areaDescription: "Central commercial & dining hub",
      },
    ],
  },
];

export function getCampusBySlug(slug: string): CampusConfig {
  return (
    SUPPORTED_CAMPUSES.find((c) => c.slug === slug) ?? SUPPORTED_CAMPUSES[0]
  );
}
