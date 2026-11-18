import { Request, Response } from 'express';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
    errors: [
      {
        path: req.originalUrl,
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    ],
  });
};
