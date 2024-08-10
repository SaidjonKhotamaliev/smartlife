export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 301,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVICE_ERROR = 500,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong!",
  NOT_DATA_FOUND = "No data is found!",
  CREATE_FAILED = "Create is failed!",
  UPDATE_FAILED = "Update is failed!",
  BLOCKED_USER = "You have been blocked, contact restaurant",

  USED_NICK_PHONE = "You are using already used nick or phone number!",
  NO_MEMBER_NICK = "No member with that member nick!",
  WRONG_PASSWORD = "Wrong password, please try again!",
  NOT_AUTHENTICATED = "You are not authenticated, please login first!",
  TOKEN_CREATION_FAILED = "Token creation error",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standart = {
    code: HttpCode.INTERNAL_SERVICE_ERROR,
    Message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}

export default Errors;
