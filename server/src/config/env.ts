import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rsb_portal?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_placeholder',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_token_secret_placeholder',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MAX_ALLOWED_DEVICES: parseInt(process.env.MAX_ALLOWED_DEVICES || '2', 10),
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.example.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || 'noreply@rayhanspecialbatch.com',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
};
