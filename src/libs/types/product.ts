import { ProductCollection, ProductStatus } from "../enums/product.enum";
import { ObjectId } from "mongoose";

export interface ProductInput {
  productStatus?: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  prodcutOnSale?: number;
  productSalePrice?: number;
  productCombinedPrice?: number;
}

export interface Product {
  _id: ObjectId;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productDesc?: string;
  productImages: string[];
  productViews: number;
  prodcutOnSale?: number;
  productSalePrice?: number;
  productCombinedPrice: number;
  productOrders?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUpdateInput {
  _id: ObjectId;
  productStatus?: ProductStatus;
  productCollection?: ProductCollection;
  productName?: string;
  productPrice?: number;
  productLeftCount?: number;
  productDesc?: string;
  productImages?: string[];
  productViews?: number;
  productOnSale?: number;
  productSalePrice?: number;
  productCombinedPrice?: number;
}

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}
