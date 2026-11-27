import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CampusModel from "@/models/Campus";
import { CAMPUS_COLLECTION, CampusDirectoryEntry } from "@/data/campuses";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const existingCount = await CampusModel.estimatedDocumentCount();
    if (existingCount === 0) {
      await CampusModel.insertMany(
        CAMPUS_COLLECTION.map((c) => ({
          slug: c.slug,
          name: c.name,
          shortName: c.shortName,
          university: c.university,
          city: c.city,
          state: c.state,
          lat: c.lat,
          lng: c.lng,
          isActive: true,
        })),
        { ordered: false }
      ).catch(() => {});
    }

    const docs = await CampusModel.find({ isActive: true }).sort({ name: 1 }).lean();
    if (docs.length > 0) {
      const data: CampusDirectoryEntry[] = docs.map((d: any) => ({
        id: String(d._id || d.slug),
        slug: d.slug,
        name: d.name,
        shortName: d.shortName,
        university: d.university,
        city: d.city || "",
        state: d.state || "",
        lat: Number(d.lat),
        lng: Number(d.lng),
      }));
      return NextResponse.json({ success: true, data });
    }
  } catch {
    // Graceful fallback to static campus directory if MongoDB is unavailable
  }

  return NextResponse.json({ success: true, data: CAMPUS_COLLECTION });
}
