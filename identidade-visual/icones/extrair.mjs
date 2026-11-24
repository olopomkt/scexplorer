// Separa o sprite do app (src/sprite.svg) em um SVG avulso por ícone, para usar fora do app
// (Figma, Canva, peças, apresentações). Rode de novo sempre que o sprite do app mudar.
// Uso: node extrair.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const sprite = readFileSync(join(aqui, '..', '..', 'src', 'sprite.svg'), 'utf8').replace(/\r\n/g, '\n');
writeFileSync(join(aqui, 'sprite.svg'), sprite); // cópia do kit sempre igual à do app

const gradientes = Object.fromEntries(
  [...sprite.matchAll(/<(linearGradient|radialGradient) id="([^"]+)"[\s\S]*?<\/\1>/g)].map((m) => [m[2], m[0]]),
);
const simbolos = [...sprite.matchAll(/<symbol id="([^"]+)" viewBox="([^"]+)">([\s\S]*?)<\/symbol>/g)]
  .map(([, id, viewBox, corpo]) => ({ id, viewBox, corpo }));

// No app a nuvem muda de cor com o tema por variável de CSS; no arquivo avulso vira o degradê de cada tema.
const NUVEM = {
  escuro: { '--nuvem': 'g-nuvem', '--nuvem-esc': 'g-nuvem-esc' },
  claro: { '--nuvem': 'g-nuvem-c', '--nuvem-esc': 'g-nuvem-esc-c' },
};

for (const pasta of ['interface', 'clima']) rmSync(join(aqui, pasta), { recursive: true, force: true });
mkdirSync(join(aqui, 'interface'), { recursive: true });
for (const tema of Object.keys(NUVEM)) mkdirSync(join(aqui, 'clima', tema), { recursive: true });

let nInterface = 0, nClima = 0;
for (const { id, viewBox, corpo } of simbolos) {
  if (id.startsWith('i-')) {
    // ícones de traço: no app a cor vem do texto (currentColor), traço 1,8
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>\n`;
    writeFileSync(join(aqui, 'interface', `${id.slice(2)}.svg`), svg);
    nInterface++;
  } else if (id.startsWith('t-')) {
    for (const [tema, mapa] of Object.entries(NUVEM)) {
      const c = corpo.replace(/style="fill:var\((--[a-z-]+),[^)]*\)"/g, (_, v) => `fill="url(#${mapa[v]})"`);
      const usados = [...new Set([...c.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))];
      const defs = usados.length ? `<defs>${usados.map((g) => gradientes[g]).join('')}</defs>` : '';
      writeFileSync(join(aqui, 'clima', tema, `${id.slice(2)}.svg`),
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="${viewBox}">${defs}${c}</svg>\n`);
    }
    nClima++;
  }
}
console.log(`interface: ${nInterface} ícones · clima: ${nClima} ícones × 2 temas`);
