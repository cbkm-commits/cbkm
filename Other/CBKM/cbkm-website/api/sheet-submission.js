const crypto = require('crypto');

const SPREADSHEET_ID = '1igws_E-QnPGAxigc0QbzaQxbbLnEamIDKHK0qdWr7xI';
const SHEET_NAME = 'Web Submission';

function b64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleToken(clientEmail, privateKey, privateKeyId) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: clientEmail,
    sub: clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
  }));
  const signingInput = `${header}.${claim}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const sig = sign.sign(privateKey, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const jwt = `${signingInput}.${sig}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fields } = req.body || {};

  const clientEmail = (process.env.GOOGLE_CLIENT_EMAIL || '').trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const privateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID;

  if (!clientEmail || !rawKey) {
    return res.status(200).json({ sent: false, reason: 'Google credentials not configured' });
  }

  try {
    // Handle both: real newlines (from Vercel file input) and escaped \n (from manual entry)
    const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

    const token = await getGoogleToken(clientEmail, privateKey, privateKeyId);

    const rowValues = (fields || []).map(f => String(f.value ?? ''));

    const range = encodeURIComponent(`${SHEET_NAME}!A1`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowValues] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Sheets error:', errText);
      return res.status(500).json({ error: 'Failed to write to Google Sheet', detail: errText });
    }

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('sheet-submission error:', err);
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
};
