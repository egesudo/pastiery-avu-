import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self' https://aistudio.google.com https://*.aistudio.google.com https://*.googleusercontent.com",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com",
  "media-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "connect-src 'self' ws: wss:",
  "form-action 'self'",
].join('; ');

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SIMPLE_FORM_CSRF_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

/**
 * Normalizes an HTTP/HTTPS origin string.
 * @param {string | undefined} rawOrigin
 * @returns {string | null}
 */
function normalizeOrigin(rawOrigin) {
  if (!rawOrigin) return null;
  try {
    const parsed = new URL(rawOrigin.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Validates upstream proxy target URL when UPSTREAM_URL is configured.
 * @param {string | undefined} rawUrl
 * @returns {URL | null}
 */
function parseUpstreamUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Builds allowed origins for CORS and CSRF validation.
 * @returns {Set<string>}
 */
function buildAllowedOrigins() {
  const allowed = new Set();
  const appOrigin = normalizeOrigin(process.env.APP_URL);
  if (appOrigin) {
    allowed.add(appOrigin);
  }
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }
  return allowed;
}

/**
 * Checks whether an Origin or Referer header matches the allowlist or current Host.
 * @param {string | undefined} rawHeader
 * @param {Set<string>} allowedOrigins
 * @param {import('express').Request} req
 * @returns {boolean}
 */
function isAllowedRequestOrigin(rawHeader, allowedOrigins, req) {
  const normalized = normalizeOrigin(rawHeader);
  if (!normalized) return false;
  if (allowedOrigins.has(normalized)) return true;

  const forwardedHost = req.headers['x-forwarded-host'];
  const rawHost =
    (typeof forwardedHost === 'string'
      ? forwardedHost.split(',')[0]?.trim()
      : undefined) || req.headers.host;

  if (!rawHost) return false;
  try {
    return new URL(normalized).host === rawHost;
  } catch {
    return false;
  }
}

/**
 * Express middleware emitting hardened HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function securityHeadersMiddleware(_req, res, next) {
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
}

/**
 * Strict origin-checked CORS middleware (never emits wildcard *).
 * @param {Set<string>} allowedOrigins
 */
function createCorsMiddleware(allowedOrigins) {
  return (req, res, next) => {
    const requestOrigin = req.headers.origin;
    if (!requestOrigin) {
      next();
      return;
    }

    const normalized = normalizeOrigin(requestOrigin);
    if (!isAllowedRequestOrigin(requestOrigin, allowedOrigins, req)) {
      if (req.path.startsWith('/api/')) {
        res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
        return;
      }
      next();
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', normalized);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * CSRF guard for state-changing API requests.
 * @param {Set<string>} allowedOrigins
 */
function createCsrfMiddleware(allowedOrigins) {
  return (req, res, next) => {
    if (SAFE_HTTP_METHODS.has(req.method.toUpperCase())) {
      next();
      return;
    }

    const fetchSite = req.headers['sec-fetch-site'];
    if (typeof fetchSite === 'string' && fetchSite.toLowerCase() === 'cross-site') {
      res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
      return;
    }

    const originHeader = req.headers.origin;
    if (typeof originHeader === 'string') {
      if (!isAllowedRequestOrigin(originHeader, allowedOrigins, req)) {
        res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
        return;
      }
    } else if (typeof req.headers.referer === 'string') {
      if (!isAllowedRequestOrigin(req.headers.referer, allowedOrigins, req)) {
        res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
        return;
      }
    }

    const contentType = (req.headers['content-type'] ?? '').toLowerCase();
    const hasCustomHeader = Boolean(req.headers['x-requested-with']);
    const isSimpleFormCsrf = SIMPLE_FORM_CSRF_TYPES.some((type) =>
      contentType.includes(type)
    );
    if (isSimpleFormCsrf && !hasCustomHeader) {
      res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
      return;
    }

    next();
  };
}

/**
 * Sliding-window in-memory rate limiter for API routes.
 * @param {number} windowMs
 * @param {number} maxRequests
 */
function createRateLimiter(windowMs, maxRequests) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const buckets = new Map();

  return (req, res, next) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = buckets.get(clientIp);

    if (!existing || existing.resetAt <= now) {
      buckets.set(clientIp, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      res.status(429).json({
        error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      });
      return;
    }

    existing.count += 1;
    next();
  };
}

/**
 * Lightweight reverse-proxy middleware when UPSTREAM_URL is explicitly configured.
 * Strips upstream server-version headers and preserves local security headers.
 * @param {URL} upstreamUrl
 */
function createUpstreamProxyMiddleware(upstreamUrl) {
  const client = upstreamUrl.protocol === 'https:' ? https : http;

  return (req, res, next) => {
    const targetUrl = new URL(req.originalUrl, upstreamUrl);
    const forwardHeaders = { ...req.headers, host: upstreamUrl.host };
    delete forwardHeaders['content-length'];

    const proxyReq = client.request(
      targetUrl,
      {
        method: req.method,
        headers: forwardHeaders,
        timeout: 15_000,
      },
      (proxyRes) => {
        const safeHeaders = { ...proxyRes.headers };
        delete safeHeaders['x-powered-by'];
        delete safeHeaders.server;

        res.status(proxyRes.statusCode || 502);
        for (const [key, value] of Object.entries(safeHeaders)) {
          if (value !== undefined && !res.hasHeader(key)) {
            res.setHeader(key, value);
          }
        }
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', () => {
      if (!res.headersSent) {
        res.status(502).type('text/plain').send('Hizmet geçici olarak kullanılamıyor.');
      }
    });

    req.pipe(proxyReq);
    void next;
  };
}

/**
 * Creates the Express security proxy / static-serving application.
 * @param {{
 *   distDir?: string;
 *   upstreamUrl?: string;
 *   rateLimitMax?: number;
 *   rateLimitWindowMs?: number;
 * }} [options]
 */
export function createStaticSecurityApp(options = {}) {
  const app = express();
  const distDir = path.resolve(options.distDir ?? path.join(__dirname, 'dist'));
  const upstreamUrl = parseUpstreamUrl(
    options.upstreamUrl ?? process.env.UPSTREAM_URL
  );
  const rateLimitWindowMs = options.rateLimitWindowMs ?? 60_000;
  const rateLimitMax = options.rateLimitMax ?? 60;
  const allowedOrigins = buildAllowedOrigins();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeadersMiddleware);
  app.use(createCorsMiddleware(allowedOrigins));
  app.use('/api', createCsrfMiddleware(allowedOrigins));
  app.use(express.json({ limit: '16kb' }));

  const apiLimiter = createRateLimiter(rateLimitWindowMs, rateLimitMax);
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/admin', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Yetkisiz erişim.' });
      return;
    }
    res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'İstenen uç nokta bulunamadı.' });
  });

  if (upstreamUrl) {
    app.use(createUpstreamProxyMiddleware(upstreamUrl));
  } else {
    app.use(
      express.static(distDir, {
        dotfiles: 'deny',
        index: 'index.html',
        setHeaders(res, filePath) {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      const indexPath = path.resolve(distDir, 'index.html');
      if (!indexPath.startsWith(distDir + path.sep) || !fs.existsSync(indexPath)) {
        res.status(404).type('text/plain').send('Sayfa bulunamadı.');
        return;
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexPath);
    });
  }

  /** @type {import('express').ErrorRequestHandler} */
  const errorHandler = (err, req, res, _next) => {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? err.status
        : undefined;
    const isJsonSyntaxError = err instanceof SyntaxError && status === 400;

    if (isJsonSyntaxError) {
      res.status(400).json({ error: 'Geçersiz istek formatı.' });
      return;
    }

    if (status === 413) {
      res.status(413).json({ error: 'İstek boyutu sınırı aşıldı.' });
      return;
    }

    if (req.path.startsWith('/api/')) {
      res.status(500).json({
        error: 'İşlem şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin.',
      });
      return;
    }

    res.status(500).type('text/plain').send('Bir sorun oluştu.');
  };

  app.use(errorHandler);
  return app;
}

const isDirectEntry =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectEntry) {
  const port = Number(process.env.PORT) || 3000;
  const app = createStaticSecurityApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Static security server listening on http://0.0.0.0:${port}`);
  });
}
