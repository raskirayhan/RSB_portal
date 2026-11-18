import QRCode from 'qrcode';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

export interface QrPayload {
  studentId: string;
  userId: string;
  name: string;
  academicLevel: string;
  signature: string;
  generatedAt: string;
}

export class QrService {
  /**
   * Generates a tamper-proof signed payload for student offline QR badge.
   */
  static generateBadgePayload(studentId: string, userId: string, name: string, academicLevel: string): string {
    const rawData = `${studentId}:${userId}:${name}:${academicLevel}`;
    const signature = crypto.createHmac('sha256', ENV.JWT_SECRET).update(rawData).digest('hex').slice(0, 16);

    const payload: QrPayload = {
      studentId,
      userId,
      name,
      academicLevel,
      signature,
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(payload);
  }

  /**
   * Generates High-Resolution Data URL (PNG) of the QR code.
   */
  static async generateQrDataUrl(qrString: string): Promise<string> {
    return QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  }

  /**
   * Verifies scanned QR code payload integrity.
   */
  static verifyBadgePayload(payloadStr: string): { valid: boolean; data?: QrPayload } {
    try {
      const parsed: QrPayload = JSON.parse(payloadStr);
      const rawData = `${parsed.studentId}:${parsed.userId}:${parsed.name}:${parsed.academicLevel}`;
      const expectedSig = crypto.createHmac('sha256', ENV.JWT_SECRET).update(rawData).digest('hex').slice(0, 16);

      if (parsed.signature !== expectedSig) {
        return { valid: false };
      }

      return { valid: true, data: parsed };
    } catch (e) {
      return { valid: false };
    }
  }
}
