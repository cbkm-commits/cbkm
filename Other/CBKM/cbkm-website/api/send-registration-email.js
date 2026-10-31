const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    registrationId,
    type, name, email, phone,
    eventName, eventDate, eventLocation,
    numberOfTickets, adults, kidsAbove6, kidsBelow6,
    numberOfParticipants, category, performanceDetails,
    guidelinesUrl, adultTicketPrice, kidsAbove6TicketPrice,
  } = req.body || {};

  const updateEmailStatus = async (status) => {
    if (!registrationId || !supabaseUrl || !supabaseKey) return;
    await fetch(`${supabaseUrl}/rest/v1/registrations?id=eq.${registrationId}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email_status: status }),
    }).catch(() => {});
  };

  if (!email || !name || !eventName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({ sent: false, reason: 'Supabase not configured' });
  }

  try {
    const configKey = type === 'attendee' ? 'attendee_email_config' : 'participant_email_config';
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?key=in.(smtp_config,${configKey})&select=key,value`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    );
    const rows = await response.json();
    const smtpRow = rows.find(r => r.key === 'smtp_config');
    const emailCfgRow = rows.find(r => r.key === configKey);

    if (!smtpRow) return res.status(200).json({ sent: false, reason: 'SMTP not configured' });

    const smtp = JSON.parse(smtpRow.value);
    if (!smtp.smtpHost || !smtp.smtpUser || !smtp.smtpPass) {
      return res.status(200).json({ sent: false, reason: 'SMTP credentials incomplete' });
    }

    const emailCfg = emailCfgRow ? JSON.parse(emailCfgRow.value) : null;
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric',
    });

    const totalAmount = ((adults || 0) * (adultTicketPrice || 0)) + ((kidsAbove6 || 0) * (kidsAbove6TicketPrice || 0));

    let body = emailCfg?.body || `Dear ${name}, thank you for registering for ${eventName}.`;
    body = body
      .replace(/\{\{name\}\}/g, name || '')
      .replace(/\{\{email\}\}/g, email || '')
      .replace(/\{\{phone\}\}/g, phone || '')
      .replace(/\{\{event\}\}/g, eventName || '')
      .replace(/\{\{date\}\}/g, formattedDate)
      .replace(/\{\{location\}\}/g, eventLocation || '')
      .replace(/\{\{tickets\}\}/g, numberOfTickets || 0)
      .replace(/\{\{adults\}\}/g, adults || 0)
      .replace(/\{\{kidsAbove6\}\}/g, kidsAbove6 || 0)
      .replace(/\{\{kidsBelow6\}\}/g, kidsBelow6 || 0)
      .replace(/\{\{participants\}\}/g, numberOfParticipants || 0)
      .replace(/\{\{category\}\}/g, category || '')
      .replace(/\{\{performanceDetails\}\}/g, performanceDetails || '')
      .replace(/\{\{totalAmount\}\}/g, `$${totalAmount.toFixed(2)}`);

    let subject = emailCfg?.subject || `Registration Confirmed – ${eventName}`;
    subject = subject.replace(/\{\{event\}\}/g, eventName || '');

    const transporter = nodemailer.createTransport({
      host: smtp.smtpHost,
      port: parseInt(smtp.smtpPort) || 587,
      secure: parseInt(smtp.smtpPort) === 465,
      auth: { user: smtp.smtpUser, pass: smtp.smtpPass },
    });

    const mailOptions = {
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to: email,
      subject,
      html: body,
      attachments: [],
    };

    // Fetch and attach the guidelines PDF for participants only
    if (guidelinesUrl && type === 'participant') {
      try {
        const pdfResp = await fetch(guidelinesUrl);
        if (pdfResp.ok) {
          const pdfBuffer = Buffer.from(await pdfResp.arrayBuffer());
          mailOptions.attachments.push({
            filename: 'Event_Guidelines.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          });
        }
      } catch (pdfErr) {
        console.warn('Could not fetch guidelines PDF:', pdfErr);
      }
    }

    await transporter.sendMail(mailOptions);
    await updateEmailStatus('sent');
    return res.status(200).json({ sent: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('send-registration-email error:', msg);
    await updateEmailStatus('failed');
    return res.status(500).json({ error: 'Failed to send email', detail: msg });
  }
};
