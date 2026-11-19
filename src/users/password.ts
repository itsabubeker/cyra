import { timingSafeEqual, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 32;

export const hashPassword = async (plain: string) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;

  return `${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async ({
  plain,
  passwordHash,
}: {
  plain: string;
  passwordHash: string;
}) => {
  const parts = passwordHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) return false;
  const derivedKey = (await scryptAsync(plain, salt, KEY_LENGTH)) as Buffer;

  return timingSafeEqual(keyBuffer, derivedKey);
};
