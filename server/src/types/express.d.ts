import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Locals {
      user: User;
    }
  }
}

export {};