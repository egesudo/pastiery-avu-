import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../server.ts';
import { JsonLd } from '../components/JsonLd';
import { WhatsAppActionButton } from '../components/WhatsAppActionButton';
import {
  TRUSTED_INSTAGRAM_HOSTS,
  TRUSTED_MAPS_EMBED_HOSTS,
  TRUSTED_MAPS_LINK_HOSTS,
  buildSafeWhatsAppUrl,
  isAllowedHttpsUrl,
  isValidProductCategory,
  sanitizeOriginUrl,
  sanitizeSafeHref,
  sanitizeTextInput,
  serializeJsonLdSafe,
} from '../utils/security';

function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'test') {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx|html)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('XSS (Cross-Site Scripting) Protection Suite', () => {
  it('blocks HTML script-tag breakout and line-separator injection in JSON-LD serialization', () => {
    const xssPayload = '</script><script>alert(document.cookie)</script>';
    const serialized = serializeJsonLdSafe({
      name: xssPayload,
      note: '"><img src=x onerror=alert(1)> & <svg onload=alert(1)> \u2028\u2029',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<script>');
    expect(serialized).not.toContain('<');
    expect(serialized).not.toContain('>');
    expect(serialized).not.toContain('&');
    expect(serialized).not.toContain('\u2028');
    expect(serialized).not.toContain('\u2029');
    expect(JSON.parse(serialized)).toEqual({
      name: xssPayload,
      note: '"><img src=x onerror=alert(1)> & <svg onload=alert(1)> \u2028\u2029',
    });
  });

  it('renders JsonLd component without raw HTML breakout tags', () => {
    const html = renderToStaticMarkup(React.createElement(JsonLd));
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain('Bakery');
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('onerror=');
  });

  it('rejects javascript:, vbscript:, data:, credential-stuffed, and spoofed-domain URLs', () => {
    const maliciousUrls = [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(document.domain)',
      '  \tjavascript:alert(1)',
      'vbscript:msgbox(1)',
      'data:text/html,<script>alert(1)</script>',
      'blob:https://attacker.example/payload',
      'http://www.google.com/maps',
      'https://user:pass@www.google.com/maps',
      'https://www.google.com@attacker.example/maps',
      'https://www.google.com.evil.tld/maps',
      'https://sub.www.google.com/maps',
    ];

    for (const url of maliciousUrls) {
      expect(isAllowedHttpsUrl(url, TRUSTED_MAPS_LINK_HOSTS)).toBe(false);
      expect(sanitizeSafeHref(url, TRUSTED_INSTAGRAM_HOSTS)).toBe('#');
    }

    expect(
      sanitizeSafeHref('https://www.instagram.com/cavusogullari', TRUSTED_INSTAGRAM_HOSTS)
    ).toBe('https://www.instagram.com/cavusogullari');
    expect(
      isAllowedHttpsUrl(
        'https://www.google.com/maps?q=Halkali&output=embed',
        TRUSTED_MAPS_EMBED_HOSTS
      )
    ).toBe(true);
  });

  it('sanitizes WhatsApp URLs and safely renders WhatsAppActionButton against XSS payloads', () => {
    const safeUrl = buildSafeWhatsAppUrl(
      '905551112233@evil.com',
      'Merhaba\r\n\x00 <script>alert(1)</script> ' + 'A'.repeat(600)
    );
    const parsed = new URL(safeUrl);

    expect(parsed.protocol).toBe('https:');
    expect(parsed.hostname).toBe('wa.me');
    expect(parsed.pathname).toBe('/90XXXXXXXXXX');
    expect(parsed.searchParams.get('text')?.length).toBeLessThanOrEqual(450);
    expect(parsed.searchParams.get('text')).not.toMatch(/[\u0000-\u001F\u007F]/);

    const rendered = renderToStaticMarkup(
      React.createElement(WhatsAppActionButton, {
        href: safeUrl,
        label: '"><img src=x onerror=alert(1)>',
      })
    );
    expect(rendered).toContain('rel="noopener noreferrer"');
    expect(rendered).toContain('https://wa.me/90XXXXXXXXXX');
    expect(rendered).not.toContain('<img src=x');
  });

  it('validates JSON-LD origin URLs strictly and rejects javascript/credential origins', () => {
    expect(sanitizeOriginUrl('javascript:alert(1)')).toBe(
      'https://cavusogullaripastaneleri.com'
    );
    expect(sanitizeOriginUrl('https://user:pass@example.com')).toBe(
      'https://cavusogullaripastaneleri.com'
    );
    expect(sanitizeOriginUrl('https://cavusogullaripastaneleri.com/some/path?x=1')).toBe(
      'https://cavusogullaripastaneleri.com'
    );
  });

  it('blocks prototype pollution, injection strings, and XSS vectors in category & text helpers', () => {
    expect(isValidProductCategory('yas-pasta')).toBe(true);
    expect(isValidProductCategory('ekler-ibiza')).toBe(true);
    expect(isValidProductCategory('kuru-pasta')).toBe(true);
    expect(isValidProductCategory('sutlu-tatlilar')).toBe(true);

    expect(isValidProductCategory('__proto__')).toBe(false);
    expect(isValidProductCategory('constructor')).toBe(false);
    expect(isValidProductCategory('prototype')).toBe(false);
    expect(isValidProductCategory("' OR '1'='1")).toBe(false);
    expect(isValidProductCategory('<img src=x onerror=alert(1)>')).toBe(false);
    expect(sanitizeTextInput('  Test\n\tInput\x00  ', 15)).toBe('Test Input');
  });
});

describe('CSRF (Cross-Site Request Forgery) & CORS Protection Suite', () => {
  it('blocks untrusted Origin on GET and state-changing POST requests without wildcard CORS', async () => {
    const app = await createApp({ enableVite: false });

    const evilGet = await request(app)
      .get('/api/health')
      .set('Origin', 'https://attacker.example');
    expect(evilGet.status).toBe(403);
    expect(evilGet.headers['access-control-allow-origin']).toBeUndefined();

    const evilPost = await request(app)
      .post('/api/health')
      .set('Origin', 'https://attacker.example')
      .send({ action: 'forge' });
    expect(evilPost.status).toBe(403);
    expect(evilPost.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('blocks sandboxed iframe null-Origin CSRF attacks on mutating API routes', async () => {
    const app = await createApp({ enableVite: false });

    const nullOriginPost = await request(app)
      .post('/api/health')
      .set('Origin', 'null')
      .send({ action: 'sandboxed-csrf' });
    expect(nullOriginPost.status).toBe(403);
  });

  it('blocks Sec-Fetch-Site: cross-site CSRF probes on POST/PUT/DELETE methods', async () => {
    const app = await createApp({ enableVite: false });

    for (const method of ['post', 'put', 'delete'] as const) {
      const res = await request(app)
        [method]('/api/health')
        .set('Sec-Fetch-Site', 'cross-site')
        .send({ attempt: true });
      expect(res.status).toBe(403);
    }
  });

  it('blocks cross-site Referer requests when Origin header is omitted', async () => {
    const app = await createApp({ enableVite: false });

    const crossReferer = await request(app)
      .post('/api/health')
      .set('Referer', 'https://evil-phish.example/form.html')
      .send({ attempt: true });
    expect(crossReferer.status).toBe(403);
  });

  it('blocks classic HTML form-encoded/multipart/text simple-request CSRF payloads', async () => {
    const app = await createApp({ enableVite: false });

    for (const mime of [
      'application/x-www-form-urlencoded',
      'multipart/form-data; boundary=----WebKitFormBoundary',
      'text/plain',
    ]) {
      const formRes = await request(app)
        .post('/api/health')
        .set('Content-Type', mime)
        .send('payload=evil');
      expect(formRes.status).toBe(403);
    }
  });

  it('allows trusted local Origin preflight without wildcard Access-Control-Allow-Origin', async () => {
    const app = await createApp({ enableVite: false });

    const preflight = await request(app)
      .options('/api/health')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST');

    expect(preflight.status).toBe(204);
    expect(preflight.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(preflight.headers['access-control-allow-origin']).not.toBe('*');
  });
});

describe('Access Control, Path Traversal, Header Hardening & DoS Protection', () => {
  it('emits hardened HTTP security headers and hides x-powered-by', async () => {
    const app = await createApp({ enableVite: false });
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
    expect(res.headers['strict-transport-security']).toContain('includeSubDomains');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['permissions-policy']).toContain('camera=()');
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");
    expect(res.headers['content-security-policy']).toContain("base-uri 'self'");
    expect(res.headers['content-security-policy']).toContain("form-action 'self'");
    expect(res.headers['content-security-policy']).toContain('frame-ancestors');
  });

  it('denies unauthenticated and unauthorized admin API requests without stack traces', async () => {
    const app = await createApp({ enableVite: false });

    const unauth = await request(app).get('/api/admin/products');
    expect(unauth.status).toBe(401);
    expect(unauth.body).toEqual({ error: 'Yetkisiz erişim.' });

    const badToken = await request(app)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer forged-token')
      .send({ name: 'test' });
    expect(badToken.status).toBe(403);
    expect(badToken.body).toEqual({ error: 'Bu işlem için yetkiniz bulunmuyor.' });

    const delAttempt = await request(app)
      .delete('/api/admin/products/1')
      .set('Authorization', 'Bearer forged-token');
    expect(delAttempt.status).toBe(403);
  });

  it('prevents path traversal and dotfile exposure', async () => {
    const app = await createApp({ enableVite: false });

    for (const probe of [
      '/../../etc/passwd',
      '/%2e%2e/%2e%2e/package.json',
      '/.env',
      '/.env.example',
      '/server.ts',
    ]) {
      const res = await request(app).get(probe);
      expect(res.text).not.toContain('"express"');
      expect(res.text).not.toContain('root:x:0:0');
      expect(res.text).not.toContain('createCsrfMiddleware');
    }
  });

  it('handles malformed JSON and large payloads safely without technical leaks', async () => {
    const app = await createApp({ enableVite: false });

    const malformed = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":');
    expect(malformed.status).toBe(400);
    expect(malformed.body).toEqual({ error: 'Geçersiz istek formatı.' });
    expect(JSON.stringify(malformed.body)).not.toContain('SyntaxError');

    const oversized = await request(app)
      .post('/api/health')
      .send({ data: 'x'.repeat(24 * 1024) });
    expect(oversized.status).toBe(413);
    expect(oversized.body).toEqual({ error: 'İstek boyutu sınırı aşıldı.' });
    expect(JSON.stringify(oversized.body)).not.toContain('PayloadTooLargeError');
  });

  it('enforces API rate limits cleanly', async () => {
    const app = await createApp({
      enableVite: false,
      rateLimitMax: 3,
      rateLimitWindowMs: 60_000,
    });

    for (let i = 0; i < 3; i++) {
      const okRes = await request(app).get('/api/health');
      expect(okRes.status).toBe(200);
    }

    const throttled = await request(app).get('/api/health');
    expect(throttled.status).toBe(429);
    expect(throttled.body.error).toBeTruthy();
  });
});

describe('Standalone Static Security Server (server.js)', () => {
  it('emits CSP, HSTS, X-Frame-Options, and X-Content-Type-Options headers and serves built static files safely', async () => {
    const tmpDist = fs.mkdtempSync(path.join(process.cwd(), '.tmp-dist-'));
    try {
      fs.writeFileSync(
        path.join(tmpDist, 'index.html'),
        '<!doctype html><html><body>OK</body></html>',
        'utf8'
      );
      fs.writeFileSync(path.join(tmpDist, '.secret'), 'TOP_SECRET', 'utf8');

      const { createStaticSecurityApp } = (await import(
        /* @vite-ignore */ pathToFileURL(path.resolve(process.cwd(), 'server.js')).href
      )) as {
        createStaticSecurityApp: (opts?: { distDir?: string }) => import('express').Express;
      };

      const staticApp = createStaticSecurityApp({ distDir: tmpDist });
      const res = await request(staticApp).get('/');

      expect(res.status).toBe(200);
      expect(res.text).toContain('OK');
      expect(res.headers['x-powered-by']).toBeUndefined();
      expect(res.headers['content-security-policy']).toContain("object-src 'none'");
      expect(res.headers['content-security-policy']).toContain("base-uri 'self'");
      expect(res.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

      // Dotfiles and traversal probes must never expose sensitive files
      const dotfileRes = await request(staticApp).get('/.secret');
      expect(dotfileRes.text).not.toContain('TOP_SECRET');

      const csrfBlocked = await request(staticApp)
        .post('/api/health')
        .set('Sec-Fetch-Site', 'cross-site')
        .send({ test: 1 });
      expect(csrfBlocked.status).toBe(403);
    } finally {
      fs.rmSync(tmpDist, { recursive: true, force: true });
    }
  });
});

describe('Static Codebase Secret, Sink & Attribute Audit', () => {
  const rootDir = process.cwd();
  const srcFiles = collectSourceFiles(path.join(rootDir, 'src'));
  const htmlFile = path.join(rootDir, 'index.html');
  const allClientFiles = [...srcFiles, htmlFile];

  it('contains zero hardcoded API keys or secret tokens in client code', () => {
    const secretPattern = /(AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|ghp_[0-9A-Za-z]{20,}|AKIA[0-9A-Z]{16})/;
    for (const file of allClientFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(secretPattern);
    }
  });

  it('contains zero unsafe DOM sinks and restricts dangerouslySetInnerHTML solely to safe JSON-LD', () => {
    const unsafeSinkPattern = /\b(innerHTML|outerHTML|eval\s*\(|new Function)\b|document\.write\s*\(/;
    for (const file of allClientFiles) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(unsafeSinkPattern);

      if (content.includes('dangerouslySetInnerHTML')) {
        expect(path.basename(file)).toBe('JsonLd.tsx');
        expect(content).toContain('serializeJsonLdSafe');
      }
    }
  });

  it('does not allow URL query parameters to expose unverified catalog items', () => {
    const catalogCode = fs.readFileSync(
      path.join(rootDir, 'src/components/Catalog.tsx'),
      'utf8'
    );
    expect(catalogCode).not.toContain('URLSearchParams');
    expect(catalogCode).not.toContain('location.search');
    expect(catalogCode).toContain('siteConfig.SHOW_UNVERIFIED');
  });

  it('ensures every external target="_blank" anchor uses rel="noopener noreferrer"', () => {
    for (const file of srcFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.matchAll(/target="_blank"([\s\S]{0,160})/g);
      for (const match of matches) {
        expect(match[1]).toContain('rel="noopener noreferrer"');
      }
    }
  });
});
