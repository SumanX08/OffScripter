import type { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { usernameSchema } from "../validator/user.validator.js";
import {
  createUser,
  getUserByClerkId,
  getUserByUsername,
} from "../services/user.service.js";
import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
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


export const updateMe = async (req: Request, res: Response) => {
  const user = res.locals.user;

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  // Validate and normalize the requested username.
  const parsed = usernameSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_USERNAME",
        message:
          "Username must contain 3–20 letters, numbers, or underscores.",
      },
    });
    return;
  }

  const newUsername = parsed.data.username.toLowerCase();
  const oldUsername = user.username;

  if (newUsername === oldUsername) {
    res.status(200).json({
      success: true,
      data: user,
    });
    return;
  }

  // Check availability before changing either profile.
  const existingUser = await getUserByUsername(newUsername);

  if (existingUser && existingUser.id !== user.id) {
    res.status(409).json({
      success: false,
      code: "USERNAME_TAKEN",
      error: {
        code: "USERNAME_TAKEN",
        message: "Username is already taken.",
      },
    });
    return;
  }

  let clerkUsernameUpdated = false;

  try {
    // Update Clerk first. If the database update fails, attempt
    // to restore the previous Clerk username.
    await clerkClient.users.updateUser(user.clerkId, {
      username: newUsername,
    });

    clerkUsernameUpdated = true;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username: newUsername },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    if (clerkUsernameUpdated) {
      try {
        await clerkClient.users.updateUser(user.clerkId, {
          username: oldUsername,
        });
      } catch (rollbackError) {
        console.error(
          "Unable to restore Clerk username after database update failure:",
          rollbackError
        );
      }
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError 
      
    ) {
      res.status(409).json({
        success: false,
        code: "USERNAME_TAKEN",
        error: {
          code: "USERNAME_TAKEN",
          message: "Username is already taken.",
        },
      });
      return;
    }

    console.error("USERNAME UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      error: {
        code: "USERNAME_UPDATE_FAILED",
        message: "Unable to update username.",
      },
    });
  }
};
