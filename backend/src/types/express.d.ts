import { Role } from "./models";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
