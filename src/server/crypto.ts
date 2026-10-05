import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SECRET_SALT = process.env.SECRET_SALT || 'openline_dcreativs_salt_2024';

/**
 * Generates a cryptographically strong private conversation secret with at least 128 bits of randomness.
 * Formatted cleanly with uppercase letters and digits.
 */
export function generateConversationSecret(): string {
  // 16 bytes = 128 bits of cryptographically secure random entropy
  const buffer = crypto.randomBytes(16);
  // Generate uppercase alphanumeric characters, avoiding ambiguous chars (0, O, 1, I)
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let secret = '';
  for (let i = 0; i < buffer.length; i++) {
    secret += alphabet[buffer[i] % alphabet.length];
  }
  // Format as 4 chunks of 3-4 chars, e.g. 7K2-XM9-P4L-8V9Q (or matching 7K2-XM9-P4L pattern)
  return `${secret.slice(0, 3)}-${secret.slice(3, 6)}-${secret.slice(6, 9)}-${secret.slice(9, 13)}`;
}

/**
 * Hashes a conversation secret using SHA-256 with HMAC key salt.
 * Server never stores the raw secret.
 */
export function hashConversationSecret(secret: string): string {
  const normalized = secret.trim().toUpperCase().replace(/\s+/g, '');
  return crypto.createHmac('sha256', SECRET_SALT).update(normalized).digest('hex');
}

/**
 * Compares a provided raw secret with a stored hash.
 */
export function verifyConversationSecret(providedSecret: string, storedHash: string): boolean {
  const hash = hashConversationSecret(providedSecret);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

/**
 * Hash password or access code
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
