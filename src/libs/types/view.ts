import { ObjectId } from "mongoose";
import { ViewGroup } from "../enums/view.enum";
ViewGroup;

export interface View {
  _id: ObjectId;
  viewGroup: ViewGroup;
  viewRefId: ObjectId;
  createdAt: Date;
  cupdatedAt: Date;
}
export interface ViewInput {
  memberId: ObjectId;
  viewRefId: ObjectId;
  viewGroup: ViewGroup;
}
