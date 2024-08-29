import { NextFunction, Request, Response } from "express";
import MemberService from "../models/member.service";
import { T } from "../libs/types/common";
import {
  ExtendedRequest,
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { AUTH_TIMER } from "../libs/config";

// REACT

const memberService = new MemberService();
const authService = new AuthService();

const memberController: T = {};

memberController.getRestaurant = async (req: Request, res: Response) => {
  try {
    console.log("getRestaurant");

    const result = await memberService.getRestaurant();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getRestaurant", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");

    const input: MemberInput = req.body,
      result: Member = await memberService.signup(input),
      token = await authService.createToken(result);
    console.log("token:", token);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, signup", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    console.log("req.body: ", req.body);

    const input: LoginInput = req.body,
      result = await memberService.login(input),
      token = await authService.createToken(result);
    console.log("token: ", token);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, login", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMemberDetail");
    const result = await memberService.getMemberDetail(req.member);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMemberDetail", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");

    const input: MemberUpdateInput = req.body;
    if (input.memberPassword === "") {
      delete input.memberPassword;
    }

    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
    const result = await memberService.updateMember(req.member, input);

    const token = await authService.createToken(result);

    console.log("token", token);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.deleteMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("deleteMember");
    console.log(req.body);

    const input: MemberUpdateInput = req.body;
    const result = await memberService.deleteMember(req.member, input);

    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, deleteMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("getTopUsers");
    const result = await memberService.getTopUsers();

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, updateMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    console.log("Error, verifyAuth", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    next();
  } catch (err) {
    console.log("Error, retrieveAuth", err);
    next();
  }
};

export default memberController;
