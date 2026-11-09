// Shared Enterprise Security Utilities for Vercel Serverless APIs
const buckets = new Map();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim().slice(0, 64);
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim().slice(0, 64);
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  if (buckets.size > 4000) {
    for (const [k, v] of buckets.entries()) {
      if (now - v.start > windowMs) buckets.delete(k);
    }
  }
  const entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.start)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count };
}

function applyApiSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (process.env.VERCEL) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
}

function verifySameOrigin(req) {
  const origin = req.headers['origin'];
  const rawHost = req.headers['x-forwarded-host'] || req.headers['host'];
  if (!origin || origin === 'null') return true;
  if (!rawHost) return true;
  const host = String(rawHost).split(',')[0].trim().toLowerCase().replace(/:(443|80)$/, '');
  try {
    const oHost = new URL(origin).host.toLowerCase().replace(/:(443|80)$/, '');
    return oHost === host;
  } catch (_) {
    return false;
  }
}

async function parseJsonBody(req, maxBytes = 16384) {
  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body)) {
      const str = req.body.toString('utf8');
      if (str.length > maxBytes) return { tooLarge: true, data: null };
      try { return { tooLarge: false, data: JSON.parse(str) }; } catch (_) { return { tooLarge: false, data: null }; }
    }
    if (typeof req.body === 'string') {
      if (req.body.length > maxBytes) return { tooLarge: true, data: null };
      try { return { tooLarge: false, data: JSON.parse(req.body) }; } catch (_) { return { tooLarge: false, data: null }; }
    }
    if (typeof req.body === 'object') {
      return { tooLarge: false, data: req.body };
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    let bytes = 0;
    let settled = false;
    req.on('data', (chunk) => {
      if (settled) return;
      const str = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      bytes += Buffer.byteLength(str, 'utf8');
      if (bytes > maxBytes) {
        settled = true;
        resolve({ tooLarge: true, data: null });
        return;
      }
      raw += str;
    });
    req.on('end', () => {
      if (settled) return;
      settled = true;
      if (!raw) return resolve({ tooLarge: false, data: null });
      try {
        resolve({ tooLarge: false, data: JSON.parse(raw) });
      } catch (_) {
        resolve({ tooLarge: false, data: null });
      }
    });
    req.on('error', () => {
      if (settled) return;
      settled = true;
      resolve({ tooLarge: false, data: null });
    });
  });
}

function stripSingleLine(str, maxLen = 140) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u0000-\u001F\u007F\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function sanitizeMultiline(str, maxLen = 3000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLen);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email) {
  if (typeof email !== 'string' || email.length < 5 || email.length > 180) return false;
  return /^[^\s@<>()[\]\\.,;:\s@"]+(\.[^\s@<>()[\]\\.,;:\s@"]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(email);
}

module.exports = {
  getClientIp,
  checkRateLimit,
  applyApiSecurityHeaders,
  verifySameOrigin,
  parseJsonBody,
  stripSingleLine,
  sanitizeMultiline,
  escapeHtml,
  isValidEmail
};
