import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface StudentStampInfo {
  name: string;
  studentId: string;
  phone: string;
  ipAddress?: string;
}

function toAsciiSafe(str: string, fallback: string): string {
  if (!str) return fallback;
  const sanitized = str.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
  return sanitized || fallback;
}

export class WatermarkService {
  /**
   * Applies dynamic anti-leak watermark onto PDF buffer for a specific student.
   */
  static async stampPdf(pdfBuffer: Buffer, student: StudentStampInfo): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const safeName = toAsciiSafe(student.name, `Student ${student.studentId}`);
    const safePhone = toAsciiSafe(student.phone, 'RSB-Verified-Phone');

    const watermarkText = `RSB * ${safeName.toUpperCase()} * ID: ${student.studentId} * ${safePhone}`;
    const securityFooter = `LICENSED FOR PERSONAL STUDY: ${safeName} (${student.studentId}) | PHONE: ${safePhone} | ${timestamp}`;

    for (const page of pages) {
      const { width, height } = page.getSize();

      // 1. Diagonal Watermark across the center
      const fontSize = 15;
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

      // Center diagonal watermark
      page.drawText(watermarkText, {
        x: width / 2 - textWidth / 3,
        y: height / 2 - 20,
        size: fontSize,
        font: font,
        color: rgb(0.85, 0.2, 0.2), // Subtle security red
        opacity: 0.18,
        rotate: degrees(-35),
      });

      // Secondary upper diagonal watermark
      page.drawText(watermarkText, {
        x: width / 3 - textWidth / 3,
        y: (height * 3) / 4,
        size: 13,
        font: font,
        color: rgb(0.2, 0.4, 0.8),
        opacity: 0.14,
        rotate: degrees(-35),
      });

      // Secondary lower diagonal watermark
      page.drawText(watermarkText, {
        x: width / 3 - textWidth / 3,
        y: height / 4,
        size: 13,
        font: font,
        color: rgb(0.2, 0.4, 0.8),
        opacity: 0.14,
        rotate: degrees(-35),
      });

      // 2. Header Bar
      page.drawRectangle({
        x: 0,
        y: height - 22,
        width: width,
        height: 22,
        color: rgb(0.08, 0.12, 0.22),
        opacity: 0.9,
      });

      page.drawText(`RAYHAN SPECIAL BATCH (RSB_PORTAL) - OFFICIAL STUDY VAULT`, {
        x: 18,
        y: height - 16,
        size: 9,
        font: font,
        color: rgb(1, 1, 1),
      });

      // 3. Footer Banner
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: 22,
        color: rgb(0.95, 0.96, 0.98),
      });

      page.drawText(securityFooter, {
        x: 16,
        y: 6,
        size: 7.5,
        font: regularFont,
        color: rgb(0.3, 0.35, 0.45),
      });
    }

    return pdfDoc.save();
  }

  /**
   * Helper to generate a clean base PDF for notes if no external file exists.
   */
  static async createSampleLecturePdf(
    title: string,
    subject: string,
    chapter: string,
    contentBulletPoints: string[]
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();

    const safeTitle = toAsciiSafe(title, 'Rayhan Special Batch - Science Lecture Sheet');
    const safeSubject = toAsciiSafe(subject, 'Science (Physics / Chemistry / Math)');
    const safeChapter = toAsciiSafe(chapter, 'Core Chapter Analysis');

    // Title Section
    page.drawText("RAYHAN SPECIAL BATCH", {
      x: 50,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.45),
    });

    page.drawText(`Subject: ${safeSubject} | Chapter: ${safeChapter}`, {
      x: 50,
      y: height - 85,
      size: 13,
      font: fontRegular,
      color: rgb(0.3, 0.4, 0.5),
    });

    page.drawText(safeTitle, {
      x: 50,
      y: height - 115,
      size: 15,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    // Divider
    page.drawLine({
      start: { x: 50, y: height - 128 },
      end: { x: width - 50, y: height - 128 },
      thickness: 1.5,
      color: rgb(0.2, 0.4, 0.8),
    });

    const defaultPoints = [
      "Core Theoretical Framework & Board Exam Top-Yield Formulas",
      "Shortcut Techniques & Calculator Tips for Problem Solving",
      "Common Pitfalls in Creative CQ Questions and In-Depth Solutions",
      "High-Order Thinking (D-Type) Standard Model Questions with Explanations",
      "Rayhan Sir Special Guidance for Scoring Full Marks in Board Evaluations",
      "Practice Homework: Cadet College & Top School Test Paper Problem Set"
    ];

    const pointsToDraw = contentBulletPoints && contentBulletPoints.length > 0 ? contentBulletPoints : defaultPoints;

    let currentY = height - 160;
    for (const point of pointsToDraw) {
      const safePoint = toAsciiSafe(point, 'Essential Science Concept & Practice Question');
      page.drawText(`*  ${safePoint}`, {
        x: 55,
        y: currentY,
        size: 11,
        font: fontRegular,
        color: rgb(0.15, 0.2, 0.25),
      });
      currentY -= 28;
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
}
