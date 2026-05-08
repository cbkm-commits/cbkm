const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ sent: false, reason: 'Supabase not configured' });
  }

  try {
    // Fetch SMTP config and notification emails from Supabase
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?key=in.(smtp_config,notification_emails)&select=key,value`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const rows = await response.json();
    const smtpRow = rows.find(r => r.key === 'smtp_config');
    const notifRow = rows.find(r => r.key === 'notification_emails');

    if (!smtpRow || !notifRow) {
      return res.status(200).json({ sent: false, reason: 'SMTP or notification emails not configured' });
    }

    const smtp = JSON.parse(smtpRow.value);
    const recipients = notifRow.value.split('\n').map(e => e.trim()).filter(Boolean);

    if (!recipients.length) {
      return res.status(200).json({ sent: false, reason: 'No notification emails configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.smtpHost,
      port: parseInt(smtp.smtpPort) || 587,
      secure: parseInt(smtp.smtpPort) === 465,
      auth: { user: smtp.smtpUser, pass: smtp.smtpPass },
    });

    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: recipients.join(', '),
      subject: `New Sponsorship Inquiry from ${name}`,
      html: `
        <h2>New Sponsorship Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p style="background:#f9f9f9;padding:12px;border-left:3px solid #ccc;">${message || '(no message)'}</p>
        <hr>
        <p style="color:#888;font-size:12px;">Submitted via the CBKM website sponsorship page.</p>
      `,
    });

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Notify error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
};
