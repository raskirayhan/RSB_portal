import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOtp = async (otp: string): Promise<string> => {
  const salt = await bcrypt.genSalt(6);
  return bcrypt.hash(otp, salt);
};

export const compareOtp = async (otp: string, hashedOtp: string): Promise<boolean> => {
  return bcrypt.compare(otp, hashedOtp);
};
