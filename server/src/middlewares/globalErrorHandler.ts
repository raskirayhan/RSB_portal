import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ENV } from '../config/env.js';

export interface IErrorMessage {
  path: string;
  message: string;
}

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errors: IErrorMessage[] = [];

  if (
    err instanceof AppError ||
    err?.name === 'AppError' ||
    (typeof err?.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
  ) {
    statusCode = err.statusCode;
    message = err.message;
    errors = [
      {
        path: req.originalUrl,
        message: err.message,
      },
    ];
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err?.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(', ')
        : (err.meta?.target as string) || 'Field';
      message = `Unique constraint failed on field(s): ${target}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found in the database';
    } else {
      message = err.message || 'Database request error';
    }
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.message || 'Unauthorized / Invalid Session Token';
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: ENV.NODE_ENV === 'development' ? err?.stack : undefined,
  });
};
