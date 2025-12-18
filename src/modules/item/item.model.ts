import { Schema, model, Document } from "mongoose";

export interface ItemDocument extends Document {
  name: string;
  quantity: number;
}

const itemSchema = new Schema<ItemDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

export const ItemModel = model<ItemDocument>("Item", itemSchema);
