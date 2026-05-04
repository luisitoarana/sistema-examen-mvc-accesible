import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_BYTES = 16;

function legacyHash(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

export function hashPassword(value) {
  const salt = randomBytes(SCRYPT_SALT_BYTES).toString('hex');
  const hash = scryptSync(String(value), salt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(value, storedHash) {
  if (!storedHash) return false;
  if (!storedHash.startsWith('scrypt$')) {
    return legacyHash(value) === storedHash;
  }
  const [, salt, expected] = storedHash.split('$');
  if (!salt || !expected) return false;
  const actual = scryptSync(String(value), salt, SCRYPT_KEYLEN);
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}
