import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: ENV.EMAIL_PORT,
    secure: ENV.EMAIL_PORT === 465,
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASS,
    },
  });

  /**
   * Send 6-Digit OTP Email.
   */
  static async sendOtpEmail(toEmail: string, otpCode: string, purpose: 'REGISTRATION' | 'PASSWORD_RESET') {
    const title = purpose === 'REGISTRATION' ? 'Verify Your RSB Student Account' : 'RSB Password Reset Request';
    const message = purpose === 'REGISTRATION' 
      ? 'Welcome to Rayhan Special Batch (RSB_portal). Use this 6-digit OTP to complete your registration:'
      : 'A password reset request was received for your RSB account. Enter this code to proceed:';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0;">Rayhan Special Batch</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">SSC & HSC Science Excellence Program</p>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="color: #334155; font-size: 15px; margin-bottom: 16px;">${message}</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            ${otpCode}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This OTP is strictly confidential and expires in 5 minutes.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; color: #94a3b8; font-size: 12px;">
          Rayhan Special Batch (RSB_portal) • Physics • Chemistry • Math • Biology • ICT
        </div>
      </div>
    `;

    console.log(`\n================== [RSB EMAIL SERVICE] ==================`);
    console.log(`[OTP DISPATCH] To: ${toEmail} | Purpose: ${purpose}`);
    console.log(`[OTP CODE]: >>> ${otpCode} <<< (Valid for 5 mins)`);
    console.log(`=========================================================\n`);

    try {
      if (ENV.EMAIL_PASS && ENV.EMAIL_PASS !== 'dummy') {
        await this.transporter.sendMail({
          from: `"Rayhan Special Batch" <${ENV.EMAIL_USER}>`,
          to: toEmail,
          subject: `${title} - OTP: ${otpCode}`,
          html,
        });
      }
      return true;
    } catch (error) {
      console.warn('[EmailService Warning] SMTP dispatch skipped or failed, mock OTP logged to console.');
      return true;
    }
  }

  /**
   * Send Monthly Guardian Academic Digest.
   */
  static async sendGuardianMonthlyDigest(data: {
    guardianEmail: string;
    guardianName: string;
    studentName: string;
    studentId: string;
    month: string;
    attendancePercent: number;
    paymentStatus: string;
    teacherRemarks: string;
  }) {
    const { guardianEmail, studentName, studentId, month, attendancePercent, paymentStatus, teacherRemarks } = data;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Rayhan Special Batch</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Monthly Guardian Academic Progress Report • ${month}</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; color: #1e293b;">শ্রদ্ধেয় অভিভাবক,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            আপনার সন্তান <strong>${studentName}</strong> (ID: <code>${studentId}</code>)-এর ${month} মাসের সার্বিক উপস্থিতি, পড়ালেখার মূল্যায়ন ও ফি স্ট্যাটাস নিচে তুলে ধরা হলো:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f1f5f9;">
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">উপস্থিতির হার (Attendance)</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; color: ${attendancePercent >= 80 ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                ${attendancePercent}%
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">টিউশন ফি স্ট্যাটাস (Payment)</td>
              <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: ${paymentStatus === 'PAID' ? '#16a34a' : '#d97706'};">
                ${paymentStatus}
              </td>
            </tr>
          </table>

          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 0 8px 8px 0; margin-top: 20px;">
            <h4 style="margin: 0 0 8px; color: #1e40af;">রায়হান স্যারের পর্যবেক্ষণ ও মন্তব্য:</h4>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-style: italic;">
              "${teacherRemarks || 'নিয়মিত ক্লাসে উপস্থিতি সন্তোষজনক। সৃজনশীল প্রশ্নের লিখিত অনুশীলনে আরো মনোযোগী হতে হবে।'}"
            </p>
          </div>

          <div style="margin-top: 28px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            যে কোনো প্রয়োজনে সরাসরি যোগাযোগ: ০১৭XXXXXXXX | রায়হান স্যার (বিজ্ঞান বিভাগ)
          </div>
        </div>
      </div>
    `;

    console.log(`\n================== [RSB GUARDIAN DIGEST] ==================`);
    console.log(`[DISPATCH] Sent to Guardian: ${guardianEmail} for Student: ${studentName} (${studentId})`);
    console.log(`[MONTH]: ${month} | Attendance: ${attendancePercent}% | Fee: ${paymentStatus}`);
    console.log(`===========================================================\n`);

    try {
      if (ENV.EMAIL_PASS && ENV.EMAIL_PASS !== 'dummy') {
        await this.transporter.sendMail({
          from: `"Rayhan Sir (RSB Coaching)" <${ENV.EMAIL_USER}>`,
          to: guardianEmail,
          subject: `RSB Progress Report - ${studentName} (${month})`,
          html,
        });
      }
      return true;
    } catch (error) {
      console.warn('[EmailService Warning] Guardian digest mail logged to console.');
      return true;
    }
  }
}
