import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function passwordMatches(password: string, passwordHash: string): Promise<boolean> {
  return argon2.verify(passwordHash, password);
}

export function createProofCode(): { code: string; codeHash: string } {
  const code = randomBytes(16).toString('base64url');
  return { code, codeHash: hashProofCode(code) };
}

export function hashProofCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function proofCodeMatches(code: string, codeHash: string): boolean {
  const actual = Buffer.from(hashProofCode(code), 'hex');
  const expected = Buffer.from(codeHash, 'hex');
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}
