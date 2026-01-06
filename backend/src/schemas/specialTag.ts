import mongoose, { Document, Schema, Model } from "mongoose";

export type SpecialTagName = "BOOSTER" | "EOTM" | "CONTENT_CREATOR";

export interface ISpecialTagDocument extends Document {
  robloxid: string;
  discordid: string;
  tags: SpecialTagName[];
}

const specialTagSchema = new Schema<ISpecialTagDocument>({
  robloxid: {
    type: String,
    required: true,
    trim: true,
  },
  discordid: {
    type: String,
    required: true,
    trim: true,
  },
  tags: {
    type: [String],
    enum: ["BOOSTER", "EOTM", "CONTENT_CREATOR"],
    default: [],
    index: true,    
  },
});

const SpecialTagModel: Model<ISpecialTagDocument> =
  mongoose.model<ISpecialTagDocument>("SpecialTag", specialTagSchema);

export default SpecialTagModel;
