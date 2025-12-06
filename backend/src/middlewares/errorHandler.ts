import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err.message);
  if (process.env.NODE_ENV !== "production") {
    console.error("Stack:", err.stack);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
    return;
  }

  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      message: err.message,
      stack: err.stack
    }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
}

export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
