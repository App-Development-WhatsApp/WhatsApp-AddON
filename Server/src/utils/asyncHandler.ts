import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: any; // Modify this type based on your actual user model
}


// This asyncHandler is a higher-order function that accepts a function as a parameter
const asyncHandler = (requestHandler: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise
      .resolve(requestHandler(req, res, next))
      .catch((err) => next(err));
  };
};

export { asyncHandler };
