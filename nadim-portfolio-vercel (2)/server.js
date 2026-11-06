const http = require('http');
const fs = require('fs');
const path = require('path');

const contactHandler = require('./api/contact');
const chatHandler = require('./api/chat');

const PUBLIC_DIR = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav'
};

function setStaticSecurityHeaders(res) {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self' https://api.web3forms.com; object-src 'none'; base-uri 'self'; form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
}

function readJsonBody(req, maxBytes = 16384) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(Object.assign(new Error('Payload too large'), { code: 413 }));
        req.destroy();
        return;
      }
      raw += chunk.toString('utf8');
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsed.pathname);

    if (pathname === '/api/contact' || pathname === '/api/chat') {
      try {
        req.body = await readJsonBody(req);
      } catch (e) {
        res.statusCode = e.code || 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
      if (pathname === '/api/contact') return await contactHandler(req, res);
      if (pathname === '/api/chat') return await chatHandler(req, res);
    }

    // Strict Path Traversal Protection
    const safeRel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(PUBLIC_DIR, safeRel);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.statusCode = 403;
      return res.end('Forbidden');
    }

    let stat = null;
    try { stat = fs.statSync(filePath); } catch (_) {}
    if (!stat || !stat.isFile()) {
      res.statusCode = 404;
      return res.end('Not Found');
    }

    setStaticSecurityHeaders(res);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');

    const total = stat.size;
    const range = req.headers.range;

    // Full RFC 7233 Byte-Range Support (Essential for iOS Safari & Android Chrome full MP3 playback & seeking)
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!match) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${total}`);
        return res.end();
      }
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : total - 1;
      if (match[1] === '' && match[2] !== '') {
        start = Math.max(0, total - parseInt(match[2], 10));
        end = total - 1;
      }
      if (isNaN(start) || isNaN(end) || start > end || start >= total) {
        res.statusCode = 416;
        res.setHeader('Content-Range', `bytes */${total}`);
        return res.end();
      }
      end = Math.min(end, total - 1);
      const chunkLen = end - start + 1;

      res.statusCode = 206;
      res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`);
      res.setHeader('Content-Length', String(chunkLen));
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    res.statusCode = 200;
    res.setHeader('Content-Length', String(total));
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio Full-Stack Server listening on http://0.0.0.0:${PORT}`);
});
