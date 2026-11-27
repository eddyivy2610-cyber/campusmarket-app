import mongoose, { Schema, Model } from "mongoose";

export interface ICampus {
  slug: string;
  name: string;
  shortName: string;
  university: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

const CampusSchema = new Schema<ICampus>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, unique: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    university: { type: String, required: true, trim: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "campuses" }
);

const CampusModel: Model<ICampus> =
  mongoose.models.Campus || mongoose.model<ICampus>("Campus", CampusSchema);

export default CampusModel;
