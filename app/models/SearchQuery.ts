import mongoose, { Schema, Model, Document } from "mongoose";

export interface ISearchQuery {
  term: string;           // lowercase normalized search term
  originalTerm: string;   // clean casing as searched
  count: number;          // number of searches recorded
  lastSearchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISearchQueryDocument extends ISearchQuery, Document {}

const SearchQuerySchema = new Schema<ISearchQueryDocument>(
  {
    term: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    originalTerm: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 1,
      min: 0,
      index: true,
    },
    lastSearchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

SearchQuerySchema.index({ count: -1, lastSearchedAt: -1 });

const SearchQueryModel: Model<ISearchQueryDocument> =
  mongoose.models.SearchQuery ||
  mongoose.model<ISearchQueryDocument>("SearchQuery", SearchQuerySchema);

export default SearchQueryModel;
