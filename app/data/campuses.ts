/**
 * Canonical Campus & University Collection for Campus Hive.
 * Used to match a user's coordinates to their nearest university/campus (without ever
 * exposing precise user coordinates publicly) and served/merged via GET /api/campuses.
 */

export interface CampusDirectoryEntry {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  university: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export const CAMPUS_COLLECTION: CampusDirectoryEntry[] = [
  {
    id: "abu-zaria-samaru",
    slug: "abu-zaria-samaru",
    name: "Ahmadu Bello University (ABU Samaru Main Campus)",
    shortName: "ABU Samaru",
    university: "Ahmadu Bello University, Zaria",
    city: "Zaria",
    state: "Kaduna",
    lat: 11.1511,
    lng: 7.6546,
  },
  {
    id: "abu-zaria-kongo",
    slug: "abu-zaria-kongo",
    name: "ABU Zaria (Kongo Campus)",
    shortName: "ABU Kongo",
    university: "Ahmadu Bello University, Zaria",
    city: "Zaria",
    state: "Kaduna",
    lat: 11.1136,
    lng: 7.7058,
  },
  {
    id: "abuth-shika",
    slug: "abuth-shika",
    name: "ABU Teaching Hospital (ABUTH)",
    shortName: "ABUTH Shika",
    university: "Ahmadu Bello University, Zaria",
    city: "Shika, Zaria",
    state: "Kaduna",
    lat: 11.1822,
    lng: 7.6114,
  },
  {
    id: "buk-kano-new",
    slug: "buk-kano-new",
    name: "Bayero University Kano (BUK)",
    shortName: "BUK Kano",
    university: "Bayero University, Kano",
    city: "Kano",
    state: "Kano",
    lat: 11.9765,
    lng: 8.4237,
  },
  {
    id: "kasu-kaduna",
    slug: "kasu-kaduna",
    name: "Kaduna State University (KASU)",
    shortName: "KASU",
    university: "Kaduna State University",
    city: "Kaduna",
    state: "Kaduna",
    lat: 10.5186,
    lng: 7.4383,
  },
  {
    id: "unilag-akoka",
    slug: "unilag-akoka",
    name: "University of Lagos (UNILAG)",
    shortName: "UNILAG",
    university: "University of Lagos",
    city: "Akoka, Lagos",
    state: "Lagos",
    lat: 6.5158,
    lng: 3.3898,
  },
  {
    id: "lasu-ojo",
    slug: "lasu-ojo",
    name: "Lagos State University (LASU)",
    shortName: "LASU",
    university: "Lagos State University",
    city: "Ojo, Lagos",
    state: "Lagos",
    lat: 6.4654,
    lng: 3.2015,
  },
  {
    id: "pau-lekki",
    slug: "pau-lekki",
    name: "Pan-Atlantic University (PAU)",
    shortName: "PAU",
    university: "Pan-Atlantic University",
    city: "Ibeju-Lekki, Lagos",
    state: "Lagos",
    lat: 6.4864,
    lng: 3.8548,
  },
  {
    id: "ui-ibadan",
    slug: "ui-ibadan",
    name: "University of Ibadan (UI)",
    shortName: "UI Ibadan",
    university: "University of Ibadan",
    city: "Ibadan",
    state: "Oyo",
    lat: 7.4443,
    lng: 3.8995,
  },
  {
    id: "oau-ife",
    slug: "oau-ife",
    name: "Obafemi Awolowo University (OAU)",
    shortName: "OAU Ife",
    university: "Obafemi Awolowo University",
    city: "Ile-Ife",
    state: "Osun",
    lat: 7.5175,
    lng: 4.527,
  },
  {
    id: "covenant-ota",
    slug: "covenant-ota",
    name: "Covenant University (CU)",
    shortName: "Covenant",
    university: "Covenant University",
    city: "Ota",
    state: "Ogun",
    lat: 6.6718,
    lng: 3.1581,
  },
  {
    id: "babcock-ilishan",
    slug: "babcock-ilishan",
    name: "Babcock University",
    shortName: "Babcock",
    university: "Babcock University",
    city: "Ilishan-Remo",
    state: "Ogun",
    lat: 6.8902,
    lng: 3.7186,
  },
  {
    id: "oou-ago-iwoye",
    slug: "oou-ago-iwoye",
    name: "Olabisi Onabanjo University (OOU)",
    shortName: "OOU",
    university: "Olabisi Onabanjo University",
    city: "Ago-Iwoye",
    state: "Ogun",
    lat: 6.9422,
    lng: 3.9203,
  },
  {
    id: "bowen-iwo",
    slug: "bowen-iwo",
    name: "Bowen University",
    shortName: "Bowen",
    university: "Bowen University",
    city: "Iwo",
    state: "Osun",
    lat: 7.6236,
    lng: 4.1891,
  },
  {
    id: "futa-akure",
    slug: "futa-akure",
    name: "Federal University of Technology, Akure (FUTA)",
    shortName: "FUTA",
    university: "Federal University of Technology, Akure",
    city: "Akure",
    state: "Ondo",
    lat: 7.3043,
    lng: 5.137,
  },
  {
    id: "aaua-akungba",
    slug: "aaua-akungba",
    name: "Adekunle Ajasin University (AAUA)",
    shortName: "AAUA",
    university: "Adekunle Ajasin University",
    city: "Akungba-Akoko",
    state: "Ondo",
    lat: 7.475,
    lng: 5.7369,
  },
  {
    id: "abuad-ado",
    slug: "abuad-ado",
    name: "Afe Babalola University (ABUAD)",
    shortName: "ABUAD",
    university: "Afe Babalola University",
    city: "Ado-Ekiti",
    state: "Ekiti",
    lat: 7.6069,
    lng: 5.3081,
  },
  {
    id: "eksu-ado",
    slug: "eksu-ado",
    name: "Ekiti State University (EKSU)",
    shortName: "EKSU",
    university: "Ekiti State University",
    city: "Ado-Ekiti",
    state: "Ekiti",
    lat: 7.7128,
    lng: 5.2506,
  },
  {
    id: "unilorin",
    slug: "unilorin",
    name: "University of Ilorin (UNILORIN)",
    shortName: "UNILORIN",
    university: "University of Ilorin",
    city: "Ilorin",
    state: "Kwara",
    lat: 8.4812,
    lng: 4.6748,
  },
  {
    id: "futminna",
    slug: "futminna",
    name: "Federal University of Technology, Minna (FUTMINNA)",
    shortName: "FUTMINNA",
    university: "Federal University of Technology, Minna",
    city: "Minna",
    state: "Niger",
    lat: 9.5359,
    lng: 6.4503,
  },
  {
    id: "uniabuja",
    slug: "uniabuja",
    name: "University of Abuja (UNIABUJA)",
    shortName: "UNIABUJA",
    university: "University of Abuja",
    city: "Gwagwalada, Abuja",
    state: "FCT",
    lat: 8.9806,
    lng: 7.1795,
  },
  {
    id: "unijos",
    slug: "unijos",
    name: "University of Jos (UNIJOS)",
    shortName: "UNIJOS",
    university: "University of Jos",
    city: "Jos",
    state: "Plateau",
    lat: 9.9511,
    lng: 8.8895,
  },
  {
    id: "udus-sokoto",
    slug: "udus-sokoto",
    name: "Usmanu Danfodiyo University (UDUS)",
    shortName: "UDUS",
    university: "Usmanu Danfodiyo University",
    city: "Sokoto",
    state: "Sokoto",
    lat: 13.128,
    lng: 5.2063,
  },
  {
    id: "unn-nsukka",
    slug: "unn-nsukka",
    name: "University of Nigeria, Nsukka (UNN)",
    shortName: "UNN Nsukka",
    university: "University of Nigeria, Nsukka",
    city: "Nsukka",
    state: "Enugu",
    lat: 6.867,
    lng: 7.4083,
  },
  {
    id: "unizik-awka",
    slug: "unizik-awka",
    name: "Nnamdi Azikiwe University (UNIZIK)",
    shortName: "UNIZIK",
    university: "Nnamdi Azikiwe University",
    city: "Awka",
    state: "Anambra",
    lat: 6.2459,
    lng: 7.1199,
  },
  {
    id: "futo-owerri",
    slug: "futo-owerri",
    name: "Federal University of Technology, Owerri (FUTO)",
    shortName: "FUTO",
    university: "Federal University of Technology, Owerri",
    city: "Owerri",
    state: "Imo",
    lat: 5.3887,
    lng: 6.9934,
  },
  {
    id: "uniben",
    slug: "uniben",
    name: "University of Benin (UNIBEN)",
    shortName: "UNIBEN",
    university: "University of Benin",
    city: "Benin City",
    state: "Edo",
    lat: 6.4018,
    lng: 5.6155,
  },
  {
    id: "delsu-abraka",
    slug: "delsu-abraka",
    name: "Delta State University (DELSU)",
    shortName: "DELSU",
    university: "Delta State University",
    city: "Abraka",
    state: "Delta",
    lat: 5.7902,
    lng: 6.1047,
  },
  {
    id: "uniport",
    slug: "uniport",
    name: "University of Port Harcourt (UNIPORT)",
    shortName: "UNIPORT",
    university: "University of Port Harcourt",
    city: "Choba, Port Harcourt",
    state: "Rivers",
    lat: 4.9019,
    lng: 6.9205,
  },
  {
    id: "rsu-ph",
    slug: "rsu-ph",
    name: "Rivers State University (RSU)",
    shortName: "RSU",
    university: "Rivers State University",
    city: "Port Harcourt",
    state: "Rivers",
    lat: 4.7958,
    lng: 6.9822,
  },
  {
    id: "uniuyo",
    slug: "uniuyo",
    name: "University of Uyo (UNIUYO)",
    shortName: "UNIUYO",
    university: "University of Uyo",
    city: "Uyo",
    state: "Akwa Ibom",
    lat: 5.0408,
    lng: 7.9218,
  },
  {
    id: "unical",
    slug: "unical",
    name: "University of Calabar (UNICAL)",
    shortName: "UNICAL",
    university: "University of Calabar",
    city: "Calabar",
    state: "Cross River",
    lat: 4.9527,
    lng: 8.3407,
  },
];

export function findNearestCampusEntry(
  lat: number,
  lng: number,
  collection: CampusDirectoryEntry[] = CAMPUS_COLLECTION
): CampusDirectoryEntry {
  const pool = collection.length > 0 ? collection : CAMPUS_COLLECTION;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let nearest = pool[0];
  let bestDist = Number.POSITIVE_INFINITY;

  for (const campus of pool) {
    if (!Number.isFinite(campus.lat) || !Number.isFinite(campus.lng)) continue;
    const dLat = toRad(campus.lat - lat);
    const dLng = toRad(campus.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(campus.lat)) * Math.sin(dLng / 2) ** 2;
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < bestDist) {
      bestDist = dist;
      nearest = campus;
    }
  }

  return nearest;
}

export interface CapturedSafetyLocation {
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

/**
 * Requests browser geolocation ONLY when explicitly triggered (sign-up or seller onboarding).
 * Resolves both the nearest campus/university (for public default selection) and the raw
 * coordinates (kept confidential for admin safety verification only).
 */
export async function requestNearestCampusAndSafetyCoords(
  options: { highAccuracy?: boolean; timeoutMs?: number; campuses?: CampusDirectoryEntry[] } = {}
): Promise<{
  granted: boolean;
  nearestCampus: CampusDirectoryEntry;
  safetyLocation: CapturedSafetyLocation | null;
  errorReason?: "denied" | "unsupported" | "unavailable";
}> {
  const fallbackCampus = (options.campuses && options.campuses[0]) || CAMPUS_COLLECTION[0];
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return {
      granted: false,
      nearestCampus: fallbackCampus,
      safetyLocation: null,
      errorReason: "unsupported",
    };
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: Boolean(options.highAccuracy),
        timeout: options.timeoutMs ?? 10000,
        maximumAge: options.highAccuracy ? 0 : 120000,
      });
    });

    const { latitude, longitude, accuracy } = position.coords;
    const nearestCampus = findNearestCampusEntry(latitude, longitude, options.campuses);
    return {
      granted: true,
      nearestCampus,
      safetyLocation: {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6)),
        accuracyMeters: Number.isFinite(accuracy) ? Math.round(accuracy) : null,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (err: any) {
    return {
      granted: false,
      nearestCampus: fallbackCampus,
      safetyLocation: null,
      errorReason: err?.code === 1 ? "denied" : "unavailable",
    };
  }
}
