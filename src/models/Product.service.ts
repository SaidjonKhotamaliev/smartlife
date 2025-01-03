import ProductModel from "../schema/Product.model";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  // SPA
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    let match: T = {};

    // Modify match based on inquiry.order
    if (inquiry.order !== "productOnSale") {
      match.productStatus = {
        $in: [ProductStatus.PROCESS, ProductStatus.ONSALE],
      };
    } else {
      match.productStatus = ProductStatus.ONSALE;
    }

    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? {
            productCombinedPrice: 1,
          }
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: { $in: [ProductStatus.PROCESS, ProductStatus.ONSALE] },
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  // SSR
  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async getSearchedProduct(input: string): Promise<Product[]> {
    const result = await this.productModel
      .find({
        productName: { $regex: new RegExp(input, "i") },
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      input.productCombinedPrice = input.productPrice;
      return await this.productModel.create(input);
    } catch (err) {
      console.error("Error model: createNewProduct", err);

      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (input.productOnSale) {
      {
        input.productSalePrice =
          result.productPrice -
          (input.productOnSale * result.productPrice) / 100;
        input.productCombinedPrice = input.productSalePrice;
      }
    } else if (input.productOnSale === 0) {
      input.productSalePrice = 0;
      input.productCombinedPrice = input.productPrice;
    }
    result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    console.log("result: ", result);

    return result;
  }
}

export default ProductService;
