import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  sessionId?: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
