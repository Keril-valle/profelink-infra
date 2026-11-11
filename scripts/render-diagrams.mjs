import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFile, mkdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const frontendRoot = resolve(process.env.FRONTEND_CONTEXT ?? '../kahoot_front_grupo2');
const { chromium } = require(resolve(frontendRoot, 'node_modules', 'playwright'));
const files = ['arquitectura', 'clases', 'modelo-datos'];
await mkdir('docs/diagramas', { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  for (const name of files) {
    const source = await readFile(`docs/diagramas/${name}.mmd`, 'utf8');
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html>
      <html><head><meta charset="utf-8"><style>
        body{background:#0b1220;color:#e5e7eb;font-family:Inter,Segoe UI,sans-serif;padding:24px}
        #diagram{display:inline-block;padding:24px;background:#111827;border:1px solid #334155;border-radius:16px}
        #diagram svg{max-width:none !important;width:1200px !important;height:auto !important}
      </style></head><body><div id="diagram"><pre class="mermaid">${source
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')}</pre></div>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'strict' });
        await mermaid.run({ querySelector: '.mermaid' });
        window.__diagramReady = true;
      </script></body></html>`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__diagramReady === true, { timeout: 30000 });
    const element = page.locator('#diagram');
    await element.screenshot({ path: `docs/diagramas/${name}.png` });
    console.log(`${name}.png`);
    await page.close();
  }
} finally {
  await browser.close();
}
