import { Response } from "express";
import { ApiResponse } from "../types/models";

export const ok = <T>(res: Response, data: T, status = 200) => {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
};

export const fail = (res: Response, error: string, status = 400) => {
  const body: ApiResponse<never> = { success: false, error };
  res.status(status).json(body);
};
