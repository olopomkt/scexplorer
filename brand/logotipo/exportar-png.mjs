// Exporta os SVGs do pacote em PNG (fundo transparente) nos tamanhos de uso.
// Uso: node exportar-png.mjs <caminho do playwright-core> <chrome.exe>
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , pw, exe] = process.argv;
const { chromium } = createRequire(pw)('playwright-core');
const aqui = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(aqui, 'png'), { recursive: true });

const SAIDAS = [
  ...['escuro', 'claro', 'branco', 'preto'].flatMap((v) => [
    [`assinatura-horizontal-${v}.svg`, `assinatura-horizontal-${v}-2000.png`, 2000],
    [`assinatura-horizontal-${v}.svg`, `assinatura-horizontal-${v}-800.png`, 800],
    [`assinatura-vertical-${v}.svg`, `assinatura-vertical-${v}-1200.png`, 1200],
    [`simbolo-${v}.svg`, `simbolo-${v}-1024.png`, 1024],
  ]),
  ['icone-app.svg', 'icone-app-1024.png', 1024], ['icone-app.svg', 'icone-app-512.png', 512],
  ['icone-app.svg', 'icone-app-192.png', 192], ['icone-app-mascara.svg', 'icone-app-mascara-512.png', 512],
  ['icone-app-mascara.svg', 'apple-touch-icon-180.png', 180], ['icone-app.svg', 'favicon-32.png', 32],
];

const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ deviceScaleFactor: 1 });
for (const [svg, png, largura] of SAIDAS) {
  const conteudo = readFileSync(join(aqui, 'svg', svg), 'utf8');
  const [, w, h] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(conteudo).map(Number);
  const altura = Math.round((largura * h) / w);
  await p.setViewportSize({ width: largura, height: altura });
  await p.setContent(`<html><body style="margin:0;background:transparent">${conteudo.replace(/width="[\d.]+" height="[\d.]+"/, `width="${largura}" height="${altura}"`)}</body></html>`);
  await p.screenshot({ path: join(aqui, 'png', png), omitBackground: true, clip: { x: 0, y: 0, width: largura, height: altura } });
  console.log('ok', png, `${largura}×${altura}`);
}
await b.close();
