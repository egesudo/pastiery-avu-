import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../server';
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

describe('Client Input, URL & JSON-LD Security', () => {
  it('blocks XSS and HTML script-tag breakout in JSON-LD serialization', () => {
    const serialized = serializeJsonLdSafe({
      name: '</script><script>alert(1)</script>',
      note: 'A & B > C < D \u2028\u2029',
    });

    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<');
    expect(serialized).not.toContain('>');
    expect(serialized).not.toContain('&');
    expect(JSON.parse(serialized)).toEqual({
      name: '</script><script>alert(1)</script>',
      note: 'A & B > C < D \u2028\u2029',
    });
  });

  it('rejects unsafe URL protocols, credentials, and lookalike untrusted hosts', () => {
    expect(isAllowedHttpsUrl('javascript:alert(1)', TRUSTED_MAPS_LINK_HOSTS)).toBe(false);
    expect(isAllowedHttpsUrl('data:text/html,<script>alert(1)</script>', TRUSTED_MAPS_LINK_HOSTS)).toBe(false);
    expect(isAllowedHttpsUrl('http://www.google.com/maps', TRUSTED_MAPS_LINK_HOSTS)).toBe(false);
    expect(isAllowedHttpsUrl('https://user:pass@www.google.com/maps', TRUSTED_MAPS_LINK_HOSTS)).toBe(false);
    expect(isAllowedHttpsUrl('https://www.google.com.evil.tld/maps', TRUSTED_MAPS_LINK_HOSTS)).toBe(false);

    expect(sanitizeSafeHref('javascript:alert(1)', TRUSTED_INSTAGRAM_HOSTS)).toBe('#');
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

  it('sanitizes WhatsApp URLs, strips control chars, and enforces length bounds', () => {
    const url = buildSafeWhatsAppUrl(
      '905551112233@evil.com',
      'Merhaba\r\n\x00 sipariş ' + 'A'.repeat(600)
    );
    const parsed = new URL(url);

    expect(parsed.protocol).toBe('https:');
    expect(parsed.hostname).toBe('wa.me');
    expect(parsed.pathname).toBe('/90XXXXXXXXXX');
    expect(parsed.searchParams.get('text')?.length).toBeLessThanOrEqual(450);
    expect(parsed.searchParams.get('text')).not.toMatch(/[\u0000-\u001F\u007F]/);
  });

  it('validates JSON-LD origin URLs strictly', () => {
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

  it('validates product categories strictly against allowlist and strips control characters', () => {
    expect(isValidProductCategory('yas-pasta')).toBe(true);
    expect(isValidProductCategory('ekler-ibiza')).toBe(true);
    expect(isValidProductCategory('kuru-pasta')).toBe(true);
    expect(isValidProductCategory('sutlu-tatlilar')).toBe(true);
    expect(isValidProductCategory('__proto__')).toBe(false);
    expect(isValidProductCategory("' OR '1'='1")).toBe(false);
    expect(isValidProductCategory('<img src=x onerror=alert(1)>')).toBe(false);
    expect(sanitizeTextInput('  Test\n\tInput\x00  ', 15)).toBe('Test Input');
  });
});

describe('Express Security Middleware & Access Controls', () => {
  it('emits hardened HTTP security headers and hides x-powered-by', async () => {
    const app = await createApp({ enableVite: false });
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['permissions-policy']).toContain('camera=()');
    expect(res.headers['content-security-policy']).toContain("object-src 'none'");
    expect(res.headers['content-security-policy']).toContain("base-uri 'self'");
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
  });

  it('enforces strict CORS origin allowlist and never returns wildcard origin', async () => {
    const app = await createApp({ enableVite: false });

    const evilRes = await request(app)
      .get('/api/health')
      .set('Origin', 'https://attacker.example');
    expect(evilRes.status).toBe(403);
    expect(evilRes.headers['access-control-allow-origin']).toBeUndefined();
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

describe('Static Codebase Secret, Sink & Attribute Audit', () => {
  const rootDir = process.cwd();
  const srcFiles = collectSourceFiles(path.join(rootDir, 'src'));
  const htmlFile = path.join(rootDir, 'index.html');
  const allClientFiles = [...srcFiles, htmlFile];

  it('contains zero hardcoded API keys or secret tokens in client code', () => {
    const secretPattern = /(AIza[0-9A-Za-z_-]{20,}|sk-[0-9A-Za-z]{20,}|ghp_[0-9A-Za-z]{20,})/;
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
