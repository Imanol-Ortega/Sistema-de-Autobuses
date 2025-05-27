import { Response } from "express";


export const validateError = (err: any, res: Response) => {
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    let errors: any = [];
    err.errors.forEach((element: any) => {
      errors.push(element.message);
    });
    return res.status(400).json({ msg: errors });
  } else if (err.code) {
    return res.status(err.code).json({ msg: err.message });
  } else return res.status(500).json({ msg: "Internal server error" });
};

export const successResponse = (response: any, res: Response) => {
  return res.status(200).json(response);
};

export const isJsonParseable = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};


