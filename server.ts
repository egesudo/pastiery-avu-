import 'dotenv/config';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface SecurityServerOptions {
  enableVite?: boolean;
  rootDir?: string;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

function normalizeOrigin(rawOrigin: string | undefined): string | null {
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

function buildAllowedOrigins(): Set<string> {
  const allowed = new Set<string>();
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

function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
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

function isAllowedRequestOrigin(
  rawOriginOrReferer: string | undefined,
  allowedOrigins: Set<string>,
  req: Request
): boolean {
  const normalized = normalizeOrigin(rawOriginOrReferer);
  if (!normalized) return false;
  if (allowedOrigins.has(normalized)) return true;

  const rawHost =
    (typeof req.headers['x-forwarded-host'] === 'string'
      ? req.headers['x-forwarded-host'].split(',')[0]?.trim()
      : undefined) || req.headers.host;

  if (!rawHost) return false;
  try {
    return new URL(normalized).host === rawHost;
  } catch {
    return false;
  }
}

function createCorsMiddleware(allowedOrigins: Set<string>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestOrigin = req.headers.origin;
    if (!requestOrigin) {
      next();
      return;
    }

    const normalized = normalizeOrigin(requestOrigin);
    const isAllowed = isAllowedRequestOrigin(requestOrigin, allowedOrigins, req);

    if (!isAllowed) {
      if (req.path.startsWith('/api/')) {
        res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
        return;
      }
      next();
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', normalized!);
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

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const SIMPLE_FORM_CSRF_TYPES = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
];

function createCsrfMiddleware(allowedOrigins: Set<string>) {
  return (req: Request, res: Response, next: NextFunction): void => {
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

function createRateLimiter(windowMs: number, maxRequests: number) {
  const buckets = new Map<string, RateBucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
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

export async function createApp(
  options: SecurityServerOptions = {}
): Promise<Express> {
  const app = express();
  const rootDir = options.rootDir ?? process.cwd();
  const enableVite =
    options.enableVite ?? process.env.NODE_ENV !== 'production';
  const rateLimitWindowMs = options.rateLimitWindowMs ?? 60_000;
  const rateLimitMax = options.rateLimitMax ?? 60;

  // Sunucu sürüm bilgisini gizle
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const allowedOrigins = buildAllowedOrigins();

  app.use(securityHeadersMiddleware);
  app.use(createCorsMiddleware(allowedOrigins));
  app.use('/api', createCsrfMiddleware(allowedOrigins));
  app.use(express.json({ limit: '16kb' }));

  const apiLimiter = createRateLimiter(rateLimitWindowMs, rateLimitMax);
  app.use('/api', apiLimiter);

  // Durum kontrolü — yalnızca temel sağlık yanıtı döner, teknik bilgi sızdırmaz
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Yetkisiz admin/yönetim uç noktaları için varsayılan kapalı (fail-closed) koruma duvarı
  app.use('/api/admin', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Yetkisiz erişim.' });
      return;
    }
    res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor.' });
  });

  // Tanımsız API yolları için genel hata yanıtı
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'İstenen uç nokta bulunamadı.' });
  });

  if (enableVite) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
      root: rootDir,
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(rootDir, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(
        express.static(distDir, {
          dotfiles: 'deny',
          index: 'index.html',
        })
      );
      app.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api/')) {
          next();
          return;
        }
        const indexPath = path.resolve(distDir, 'index.html');
        if (!indexPath.startsWith(distDir + path.sep) || !fs.existsSync(indexPath)) {
          res.status(404).end();
          return;
        }
        res.sendFile(indexPath);
      });
    }
  }

  // Genel hata yakalayıcı: istemciye kesinlikle stack trace veya teknik hata sızdırmaz
  app.use(
    (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? (err as { status?: number }).status
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
    }
  );

  return app;
}

async function startServer(): Promise<void> {
  const port = Number(process.env.PORT) || 3000;
  const app = await createApp();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

const isDirectEntry =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectEntry) {
  void startServer();
}
