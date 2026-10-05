import type { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { usernameSchema } from "../validator/user.validator.js";
import {
  createUser,
  getUserByClerkId,
  getUserByUsername,
} from "../services/user.service.js";

export const createMe = async (req: Request, res: Response) => {
  const { userId: clerkId } = getAuth(req);

  if (!clerkId) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const existingUser = await getUserByClerkId(clerkId);

  if (existingUser) {
    res.status(200).json({
      success: true,
      data: existingUser,
    });
    return;
  }

  const { username } = usernameSchema.parse(req.body);
  const normalizedUsername = username.toLowerCase();

  const existingUsername = await getUserByUsername(normalizedUsername);

  if (existingUsername) {
    res.status(409).json({
      success: false,
      error: {
        code: "USERNAME_TAKEN",
        message: "Username is already taken",
      },
    });
    return;
  }

  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    res.status(400).json({
      success: false,
      error: {
        code: "EMAIL_NOT_FOUND",
        message: "No email address found for your Clerk account",
      },
    });
    return;
  }

  const user = await createUser({
    clerkId,
    email: email.toLowerCase(),
    username: normalizedUsername,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
};

export const getMe = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: res.locals.user,
  });
};