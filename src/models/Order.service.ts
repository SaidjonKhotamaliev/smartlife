import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import { Member } from "../libs/types/member";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import MemberService from "./member.service";
import { OrderStatus } from "../libs/enums/order.enum";
import ProductModel from "../schema/Product.model";
class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly productModel;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
    this.productModel = ProductModel;
  }
  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    // Calculate the total amount for the order
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = 0;

    // Fetch product details for all items in the order
    const products = await Promise.all(
      input.map(async (item) => {
        const product = await this.productModel.findOne({
          _id: item.productId,
        });

        if (!product) {
          throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);
        }

        return {
          productId: item.productId,
          itemQuantity: item.itemQuantity,
          leftCount: product.productLeftCount,
        };
      })
    );

    console.log("check: ", products);

    // Check if all ordered quantities are within stock limits
    const isOrderValid = products.every(
      (product) => product.itemQuantity <= product.leftCount
    );

    if (!isOrderValid) {
      throw new Errors(
        HttpCode.BAD_REQUEST,
        Message.ITEM_QUANTITY_EXCEEDS_THE_LIMIT
      );
    }

    // Proceed with the rest of the order processing logic...

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      await this.recordOrderItem(orderId, input);

      return newOrder;
    } catch (err) {
      console.log("ERROR, model: createOrder", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "Inserted";
    });

    const orderItemstate = await Promise.all(promisedList);

    console.log("orderItemstate", orderItemstate);
  }

  private async recordProductLeft(orderId: ObjectId): Promise<void> {
    console.log("OTDI 3");
    orderId = shapeIntoMongooseObjectId(orderId);
    const orderItems = await this.orderItemModel.find({ orderId: orderId });
    console.log("OTDI 4");

    console.log("orderItems: ", orderItems);

    const promisedList = orderItems.map(async (item: OrderItemInput) => {
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.productModel
        .findByIdAndUpdate(
          item.productId,
          { $inc: { productOrders: +item.itemQuantity } },
          { new: true }
        )
        .exec();
      await this.productModel
        .findByIdAndUpdate(
          item.productId,
          { $inc: { productLeftCount: -item.itemQuantity } },
          { new: true }
        )
        .exec();
      return "Inserted";
    });

    const orderItemstate = await Promise.all(promisedList);

    console.log("orderItemstate", orderItemstate);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };

    const result = await this.orderModel.aggregate([
      { $match: matches },
      { $sort: { updatedAt: -1 } },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit },
      {
        $lookup: {
          from: "orderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
    ]);
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NOT_DATA_FOUND);

    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const orderId = shapeIntoMongooseObjectId(input.orderId);
    const orderStatus = input.orderStatus;
    const result = await this.orderModel
      .findByIdAndUpdate(
        { memberId: memberId, _id: orderId },
        { orderStatus: orderStatus },
        { new: true }
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    // orderStatus PAUSE => PROCESS points ++
    if (orderStatus === OrderStatus.PROCESS) {
      await this.recordProductLeft(orderId);
      await this.memberService.addUserPoint(member, 1);
    }

    return result;
  }
}

export default OrderService;
