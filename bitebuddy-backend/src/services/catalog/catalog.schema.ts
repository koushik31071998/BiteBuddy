import mongoose, { Schema, Document } from 'mongoose';

export interface ICatalog extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogSchema = new Schema<ICatalog>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Index for faster search by name
CatalogSchema.index({ name: 1 });
CatalogSchema.index({ category: 1 });

export default mongoose.model<ICatalog>('Catalog', CatalogSchema);
