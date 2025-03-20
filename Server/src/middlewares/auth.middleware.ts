import { ApiError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../utils/asyncHandler";
import { env } from "../utils/Env";
// TypeScript types for req.user and decodedToken
interface DecodedToken {
  _id: string;
}

export const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, _: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized Token");
      }

      // Decode the token
      const decodedToken:any = jwt.verify(
        token,
        env.ACCESS_TOKEN_SECRET as string
      ) as DecodedToken; // Type assertion for the decoded token
      console.log("Decoded Token:", decodedToken);

      const user = await User.findById(decodedToken.userId).select("-password -refreshToken");

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user; // Attach user to the request object
      next(); // Proceed to the next middleware
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid Access Token");
    }
  }
);
