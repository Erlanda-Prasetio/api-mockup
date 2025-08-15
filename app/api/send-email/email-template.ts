export const getEmailTemplate = (params: {
  kode_aduan: string;
  website_url: string;
  logo_url: string;
}) => `
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
              <a href="${params.website_url}" target="_blank">
                <img src="${params.logo_url}" alt="DPMPTSP Jateng Logo" style="display: block; width: 120px; border: 0;">
              </a>
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
                Kode pelaporan Anda adalah sebagai berikut. Gunakan kode ini untuk melacak status aduan Anda. Jangan berikan kode ini kepada siapa pun. Terima kasih.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px 20px 30px 20px;">
              <div style="background-color: #1a73e8; color: #ffffff; padding: 14px 28px; border-radius: 4px; font-size: 20px; font-weight: bold; letter-spacing: 2px; display: inline-block;">
                ${params.kode_aduan}
              </div>
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
