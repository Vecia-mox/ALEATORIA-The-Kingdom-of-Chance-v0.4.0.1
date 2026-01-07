
/**
 * TITAN ENGINE: AUTH SERVICE
 * Handles Registration, Login, and Token Verification.
 */

import * as crypto from 'crypto';
import { Buffer } from 'buffer';

// Use standard Node 'crypto' for hashing if bcrypt is not available in environment,
// otherwise use 'bcrypt'. For this scaffold, we simulate hashing logic.

export interface UserPayload {
  id: string;
  username: string;
  role: 'admin' | 'user';
  exp: number;
}

export class AuthService {
  private static SECRET_KEY = process.env.JWT_SECRET || 'titan_dev_secret_key_2024';

  /**
   * Hashes a password using PBKDF2 (Native Node Crypto).
   */
  public static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  /**
   * Verifies a password against a stored hash.
   */
  public static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  /**
   * Generates a JWT Token.
   */
  public static generateToken(user: { id: string, username: string, role: string }): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    };
    
    // Simple Base64 mock of JWT signing for engine scaffold
    // In prod: return jwt.sign(payload, this.SECRET_KEY);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(`${header}.${body}`)
      .digest('base64');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Verifies and decodes a JWT Token.
   */
  public static verifyToken(token: string): UserPayload | null {
    try {
      const [header, body, signature] = token.split('.');
      if (!header || !body || !signature) return null;

      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET_KEY)
        .update(`${header}.${body}`)
        .digest('base64');

      if (signature !== expectedSignature.replace(/=/g, '')) return null;

      const payload = JSON.parse(Buffer.from(body, 'base64').toString());
      if (Date.now() / 1000 > payload.exp) return null; // Expired

      return payload as UserPayload;
    } catch (e) {
      return null;
    }
  }

  /**
   * Generates a short-lived ticket for server handovers.
   */
  public static generateOneTimeTicket(userId: string): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
