import crypto from 'crypto';

export const generateSecureRandomId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  const result = new Array(length);

  for (let i = 0; i < length; i++) {
    result[i] = chars[bytes[i] % chars.length];
  }

  return result.join('');
};
