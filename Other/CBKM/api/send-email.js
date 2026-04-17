const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    smtpHost,
    smtpPort,
    smtpUsername,
    smtpPassword,
    fromEmail,
    fromName,
    toEmail,
    toName,
    eventName,
    eventDate,
    eventLocation,
    registrationType,
    formData
  } = req.body;

  // Validate required SMTP fields
  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
    return res.status(400).json({ error: 'Missing SMTP configuration. Please configure email settings in the Admin portal.' });
  }

  if (!toEmail) {
    return res.status(400).json({ error: 'Missing recipient email address.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: parseInt(smtpPort || '587', 10) === 465,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    });

    // Build a table of the submitted form fields
    const formRows = formData
      ? Object.entries(formData)
          .filter(([, v]) => v !== '' && v !== null && v !== undefined)
          .map(([key, value]) => `
            <tr>
              <td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;text-transform:capitalize;">
                ${key.replace(/([A-Z])/g, ' $1').trim()}
              </td>
              <td style="padding:6px 12px;border:1px solid #e5e7eb;">${value}</td>
            </tr>`)
          .join('')
      : '';

    const registrationLabel = registrationType === 'participant' ? 'Participant' : 'Attendee';

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827;">
        <div style="background:#7c5c1e;padding:24px 32px;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Registration Confirmed</h1>
          <p style="color:#e5d9c3;margin:6px 0 0;">Calgary Bharathi Kalai Mandram</p>
        </div>

        <div style="padding:28px 32px;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          <p style="font-size:16px;">Dear <strong>${toName || toEmail}</strong>,</p>
          <p>Thank you for registering as an <strong>${registrationLabel}</strong> for the following event:</p>

          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:20px 0;">
            <h2 style="margin:0 0 8px;font-size:18px;color:#374151;">${eventName}</h2>
            ${eventDate ? `<p style="margin:4px 0;color:#6b7280;">Date: <strong>${eventDate}</strong></p>` : ''}
            ${eventLocation ? `<p style="margin:4px 0;color:#6b7280;">Location: <strong>${eventLocation}</strong></p>` : ''}
          </div>

          ${formRows ? `
          <h3 style="font-size:15px;color:#374151;margin-bottom:8px;">Registration Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${formRows}
          </table>` : ''}

          <p style="margin-top:24px;color:#6b7280;font-size:13px;">
            If you have any questions, please contact us at <a href="mailto:info@cbkm.ca" style="color:#7c5c1e;">info@cbkm.ca</a>.
          </p>
        </div>

        <div style="padding:16px 32px;background:#f3f4f6;border-radius:0 0 8px 8px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">Calgary Bharathi Kalai Mandram &bull; Calgary, Alberta, Canada</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${fromName || 'CBKM'}" <${fromEmail}>`,
      to: toEmail,
      subject: `Registration Confirmed – ${eventName}`,
      html: htmlBody
    });

    return res.status(200).json({ success: true, message: 'Confirmation email sent successfully.' });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email.' });
  }
};
