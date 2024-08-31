import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductStatus } from "../libs/enums/product.enum";

const productSchema = new Schema(
  {
    productStatus: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.PAUSE,
    },
    productCollection: {
      type: String,
      enum: ProductCollection,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productLeftCount: {
      type: Number,
      required: true,
    },
    productDesc: {
      type: String,
    },
    productImages: {
      type: [String],
      default: [],
    },
    productViews: {
      type: Number,
      default: 0,
    },
    productOrders: {
      type: Number,
      default: 0,
    },
    productCombinedPrice: {
      type: Number,
      default: 0,
    },
    productOnSale: {
      type: Number,
      default: 0,
    },
    productSalePrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } //updated created
);

productSchema.index({ productName: 1 }, { unique: true });
export default mongoose.model("Product", productSchema);
