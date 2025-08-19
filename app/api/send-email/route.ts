import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to_email, kode_aduan } = body;

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // 
        pass: process.env.SMTP_PASS, // 
      },
    });

    // const logoBase64Path = path.join(process.cwd(), 'public', 'logo-base64.txt');
    // const logoBase64 = fs.readFileSync(logoBase64Path, 'utf8');

    // 
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Laporan Anda Kami Terima</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f7;">
          <tr>
            <td align="center" style="padding: 20px 10px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                <tr>
                  <td align="center" style="padding: 30px 20px 20px 20px;">
                    <img src="https://i.ibb.co.com/wNqzfJXD/logo-baru.png" alt="Logo Perusahaan" style="display: block; width: 120px; border: 0;">
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0 20px 20px 20px;">
                    <h1 style="margin: 0; font-family: 'Google Sans', Arial, sans-serif; font-size: 28px; color: #202124; font-weight: 400;">Laporan Anda Kami Terima</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px 40px;">
                    <p style="margin: 0; font-family: Roboto, Arial, sans-serif; font-size: 16px; color: #3c4043; line-height: 1.5;">
                      Kode pelaporan Anda adalah sebagai berikut. Silahkan Klik kode di bawah ini untuk melacak status aduan Anda. Jangan berikan kode ini kepada siapa pun. Terima kasih.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 20px 20px 20px;">
                    <a href="https://wbs-beta-six.vercel.app/#tracking?kode_aduan=${kode_aduan}" style="text-decoration: none; display: inline-block;">
                      <span style="display:inline-block; background-color: #009278; color: #ffffff; padding: 14px 28px; border-radius: 4px; font-size: 20px; font-weight: bold; letter-spacing: 2px; user-select: text; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; -webkit-touch-callout: default;">
                        ${kode_aduan}
                      </span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 40px; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-family: Roboto, Arial, sans-serif; font-size: 12px; color: #5f6368; line-height: 1.5;">
                      Anda menerima email ini sebagai konfirmasi atas laporan yang dibuat.<br>
                      &copy; 2025 DPMPTSP Provinsi Jawa Tengah, Semarang, Jawa Tengah, Indonesia.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Email content
    const mailOptions = {
      from: '"WBS DPMPTSP Jateng" <intandpmptsp@gmail.com>', // Sender address
      to: to_email, // Recipient address
      subject: 'Kode Aduan Laporan WBS DPMPTSP',
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    //console.log('Message sent: %s', info.messageId);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error details:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
