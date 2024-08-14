import { Request, Response } from "express";
import ProductService from "../models/Product.service";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection, ProductStatus } from "../libs/enums/product.enum";

const productController: T = {};

const productService = new ProductService();

// SPA

productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };

    if (productCollection)
      inquiry.productCollection = productCollection as ProductCollection;
    if (search) inquiry.search = String(search);

    console.log("inquiry: ", inquiry);
    const result = await productService.getProducts(inquiry);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params,
      memberId = req.member?._id ?? null,
      result = await productService.getProduct(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

// SSR

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();

    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.getSearchedProduct = async (req: Request, res: Response) => {
  try {
    console.log("getSearchedProduct");
    console.log("req.body", req.body);

    const data = await productService.getSearchedProduct(req.body.search);
    console.log("data: ", data);

    const products = [data];
    res.render("products", { products });
  } catch (err) {
    console.log("Error, getSearchedProduct", err);
    // if (err instanceof Errors) res.status(err.code).json(err);
    // else res.status(Errors.standart.code).json(Errors.standart);
    res.send(
      `<script>alert("${err}"); window.location.replace("/admin/product/all");</script>`
    );
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewProduct");
    console.log(req.files);

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVICE_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path;
    });

    await productService.createNewProduct(data);

    res.send(
      `<script>alert("Successfully created"); window.location.replace("/admin/product/all");</script>`
    );
  } catch (err) {
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script>alert("${message}"); window.location.replace("/admin/product/all");</script>`
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    console.log("productStatus", req.body.productStatus);

    const id = req.params.id;
    if (req.body.productOnSale >= 100 || req.body.productOnSale < 0)
      throw new Errors(
        HttpCode.NOT_MODIFIED,
        Message.YOU_CANNOT_GIVE_UP_THAT_MUCH_DISCOUNT
      );

    if (
      req.body.productOnSale &&
      req.body.productStatus !== ProductStatus.ONSALE
    )
      throw new Errors(HttpCode.NOT_MODIFIED, Message.NOT_ONSALE_PRODUCT);

    console.log("PASSED HERE 1");
    const result = await productService.updateChosenProduct(id, req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default productController;
