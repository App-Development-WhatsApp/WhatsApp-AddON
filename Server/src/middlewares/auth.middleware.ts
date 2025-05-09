import { ApiError } from "../utils/APIError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Request, Response, NextFunction } from "express";

// TypeScript types for req.user and decodedToken
interface DecodedToken {
  _id: string;
}

export interface customRequest extends Request{
  user?: any;
}
export const verifyJWT = asyncHandler(
  async (req: customRequest, _: Response, next: NextFunction): Promise<void> => {
    try {
      const token =
        req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized Token");
      }

      // Decode the token
      const decodedToken:any = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as DecodedToken; // Type assertion for the decoded token
      console.log(decodedToken)
      const user = await User.findById(decodedToken.userId).select("-password -refreshToken");
      console.log(user);
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
