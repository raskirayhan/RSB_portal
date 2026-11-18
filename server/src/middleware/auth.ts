import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token.js';
import { SessionService } from '../services/sessionService.js';
import { sendError } from '../utils/response.js';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  clientIp?: string;
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return sendError(res, 'Invalid or expired session token.', 401);
  }

  // If a sessionId is embedded, check dual-device session validity (FIFO check)
  if (decoded.sessionId) {
    const isValid = await SessionService.validateSession(decoded.sessionId);
    if (!isValid) {
      return sendError(
        res,
        'Your session has been terminated because you logged in from another device (Max 2 devices allowed).',
        401,
        { code: 'SESSION_EVICTED' }
      );
    }
  }

  req.user = decoded;
  next();
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return sendError(res, 'Forbidden: Insufficient privileges.', 403);
    }

    next();
  };
};

// Simple In-Memory Rate Limiter for Auth endpoints
const ipRequests = new Map<string, { count: number; expiresAt: number }>();

export const rateLimitOtp = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipRequests.get(ip);

    if (record && record.expiresAt > now) {
      if (record.count >= maxAttempts) {
        return sendError(res, 'Too many requests. Please try again after 15 minutes.', 429);
      }
      record.count += 1;
    } else {
      ipRequests.set(ip, { count: 1, expiresAt: now + windowMs });
    }

    next();
  };
};
