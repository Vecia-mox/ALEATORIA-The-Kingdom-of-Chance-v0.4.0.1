import { AuthService } from '../services/AuthService';

/**
 * Simulated JWT utility.
 * Uses robust encoding to handle UTF-8 characters.
 */
export class JWT {
  private static SECRET = "ALEATORIA_SECRET_KEY_2024";

  static sign(payload: any): string {
    const header = AuthService.toBase64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const stringifiedPayload = AuthService.toBase64(JSON.stringify({ ...payload, exp: Date.now() + 3600000 }));
    const signature = AuthService.toBase64(this.SECRET + stringifiedPayload);
    return `${header}.${stringifiedPayload}.${signature}`;
  }

  static verify(token: string): any | null {
    try {
      const [header, payload, signature] = token.split('.');
      const expectedSignature = AuthService.toBase64(this.SECRET + payload);
      
      if (signature !== expectedSignature) return null;
      
      const decodedPayload = JSON.parse(AuthService.fromBase64(payload));
      if (decodedPayload.exp < Date.now()) return null;
      
      return decodedPayload;
    } catch (e) {
      return null;
    }
  }
}