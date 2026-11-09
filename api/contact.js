const nodemailer = require('nodemailer');
const {
  getClientIp,
  checkRateLimit,
  applyApiSecurityHeaders,
  verifySameOrigin,
  parseJsonBody,
  stripSingleLine,
  sanitizeMultiline,
  escapeHtml,
  isValidEmail
} = require('./_security');

/* Smart Auto-Detector for Web3Forms Public Access Key across any Vercel env var naming */
function detectWeb3FormsKey() {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const directCandidates = [
    process.env.WEB3FORMS_ACCESS_KEY,
    process.env.WEB3FORMS_KEY,
    process.env.WEB3FORMS_API_KEY,
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY,
    process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
    process.env.WEB3FORM_KEY,
    process.env.WEB3FORM_ACCESS_KEY,
    process.env.WEB3FROMS_KEY,
    process.env.WEB3FROMS_ACCESS_KEY
  ];
  for (const val of directCandidates) {
    if (val && typeof val === 'string') {
      const clean = val.trim();
      if (clean && !clean.includes('your_')) return clean;
    }
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (/web3/i.test(k) && typeof v === 'string' && v.trim().length >= 20 && !v.includes('your_')) {
      return v.trim();
    }
  }
  const SYSTEM_PREFIXES = /^(VERCEL|AWS_|LAMBDA_|NODE_|NPM_|PATH|HOME|TZ|LANG|LC_|SHLVL|PWD|HOSTNAME|PORT)/i;
  for (const [k, v] of Object.entries(process.env)) {
    if (!SYSTEM_PREFIXES.test(k) && typeof v === 'string' && UUID_RE.test(v.trim())) {
      return v.trim();
    }
  }
  return '';
}

module.exports = async function handler(req, res) {
  applyApiSecurityHeaders(res);

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
  }

  if (!verifySameOrigin(req)) {
    res.statusCode = 403;
    return res.end(JSON.stringify({ ok: false, error: 'Cross-origin request blocked by security policy.' }));
  }

  const ct = String(req.headers['content-type'] || '').toLowerCase();
  if (!ct.includes('application/json')) {
    res.statusCode = 415;
    return res.end(JSON.stringify({ ok: false, error: 'Unsupported Content-Type' }));
  }

  const ip = getClientIp(req);
  const rl = checkRateLimit('contact:' + ip, 8, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfterSec));
    res.statusCode = 429;
    return res.end(JSON.stringify({
      ok: false,
      error: `Too many messages sent. Please wait ${rl.retryAfterSec}s before trying again.`
    }));
  }

  const parsed = await parseJsonBody(req, 16384);
  if (parsed.tooLarge) {
    res.statusCode = 413;
    return res.end(JSON.stringify({ ok: false, error: 'Payload too large.' }));
  }
  const body = parsed.data;
  if (!body || typeof body !== 'object') {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'Invalid request payload.' }));
  }

  // 1. Honeypot Bot Trap (must remain empty)
  if (body.website_hp && String(body.website_hp).trim() !== '') {
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, mode: 'sent' }));
  }

  // 2. Human Interaction Timing Check (>= 1.2 seconds since form load)
  const formTs = Number(body.form_ts || 0);
  if (formTs > 0 && Date.now() - formTs < 1200) {
    res.statusCode = 429;
    return res.end(JSON.stringify({ ok: false, error: 'Submission too fast. Please try again.' }));
  }

  // 3. Sanitize & Validate Fields (prevents XSS + CRLF Email Header Injection)
  const name = stripSingleLine(body.name, 90);
  const email = stripSingleLine(body.email, 160).toLowerCase();
  const service = stripSingleLine(body.service || 'Graphic Design', 70);
  const message = sanitizeMultiline(body.message, 2500);

  if (name.length < 2) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'Please enter your name (at least 2 characters).' }));
  }
  if (!isValidEmail(email)) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'Please enter a valid email address.' }));
  }
  if (message.length < 5) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: 'Please write a short project message (at least 5 characters).' }));
  }

  const receiverEmail = stripSingleLine(process.env.CONTACT_RECEIVER_EMAIL || 'nadim13158@gmail.com', 160);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeService = escapeHtml(service);
  const safeMessageHtml = escapeHtml(message).replace(/\n/g, '<br>');

  const subject = `[Portfolio Hire] ${service} — ${name}`;
  const htmlMail = `
    <div style="background:#050505;color:#f2f2f2;padding:32px;font-family:system-ui,-apple-system,sans-serif;border:1px solid #26262e;border-radius:12px;max-width:600px">
      <div style="font-size:11px;letter-spacing:2px;color:#d1162b;font-weight:700;margin-bottom:8px">SPIDER-OS // NEW PORTFOLIO INQUIRY</div>
      <h2 style="margin:0 0 20px;font-size:24px;color:#ffffff">New Message from ${safeName}</h2>
      <div style="background:#0e0e14;padding:16px;border-radius:8px;border:1px solid #22222a;margin-bottom:20px">
        <p style="margin:0 0 8px;color:#b8b8c2"><strong style="color:#fff">Client Name:</strong> ${safeName}</p>
        <p style="margin:0 0 8px;color:#b8b8c2"><strong style="color:#fff">Client Email:</strong> ${safeEmail}</p>
        <p style="margin:0;color:#b8b8c2"><strong style="color:#fff">Mission Type:</strong> ${safeService}</p>
      </div>
      <div style="background:#0b0b10;padding:18px;border-radius:8px;border-left:3px solid #d1162b;line-height:1.7;color:#e6e6ee">
        ${safeMessageHtml}
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:#7d7d82">Reply directly to this email to respond to ${safeName}.</p>
    </div>
  `;
  const textMail = `New Portfolio Inquiry\n\nName: ${name}\nEmail: ${email}\nMission Type: ${service}\n\nMessage:\n${message}\n`;

  const web3Key = detectWeb3FormsKey();

  try {
    // Provider 1: Web3Forms Free Plan (Browser-direct relay required by Web3Forms Cloudflare policy)
    if (web3Key) {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        mode: 'web3forms_client',
        accessKey: web3Key
      }));
    }

    // Provider 2: Gmail SMTP via App Password (spaces stripped automatically!)
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const gmailUser = stripSingleLine(process.env.GMAIL_USER || receiverEmail, 160);

    if (gmailPass && gmailPass !== 'your_16_char_gmail_app_password_here') {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      await transporter.sendMail({
        from: `"MD Nadim Portfolio" <${gmailUser}>`,
        to: receiverEmail,
        replyTo: email,
        subject,
        text: textMail,
        html: htmlMail
      });

      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        mode: 'sent',
        message: 'MESSAGE DELIVERED DIRECTLY TO MD NADIM KHONDOKAR!'
      }));
    }

    // Provider 3: Resend API (if RESEND_API_KEY is set on Vercel)
    const resendKey = (process.env.RESEND_API_KEY || '').trim();
    if (resendKey && !resendKey.includes('your_')) {
      const rResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
          to: [receiverEmail],
          reply_to: email,
          subject,
          html: htmlMail,
          text: textMail
        })
      });

      if (!rResp.ok) {
        throw new Error('Resend rejected transmission');
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        mode: 'sent',
        message: 'MESSAGE DELIVERED DIRECTLY TO MD NADIM KHONDOKAR!'
      }));
    }

    // No email key found in Vercel Environment Variables — return clear inline error (NEVER open phone SMS/Mail app!)
    res.statusCode = 503;
    return res.end(JSON.stringify({
      ok: false,
      mode: 'missing_key',
      error: 'Direct email key not active yet — add WEB3FORMS_ACCESS_KEY (or GMAIL_APP_PASSWORD) in Vercel Environment Variables and Redeploy.'
    }));
  } catch (err) {
    console.error('[CONTACT_API_ERROR]', err && err.message ? err.message : 'Unknown error');
    // If SMTP threw an error and a Web3Forms key is also present, fall back to Web3Forms client relay
    if (web3Key) {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        ok: true,
        mode: 'web3forms_client',
        accessKey: web3Key
      }));
    }
    res.statusCode = 502;
    return res.end(JSON.stringify({
      ok: false,
      error: 'Email delivery server failed — please verify your WEB3FORMS_ACCESS_KEY or GMAIL_APP_PASSWORD in Vercel settings.'
    }));
  }
};
