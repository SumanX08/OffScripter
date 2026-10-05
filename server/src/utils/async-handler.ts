import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

export const asyncHandler = <P = Record<string, string>>(
  handler: (
    req: Request<P>,
    res: Response,
    next: NextFunction
  ) => Promise<void>
): RequestHandler<P> => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};