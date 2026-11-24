# Gera o pacote do logotipo do SC Explorer (SVG com texto em curvas, independente de fonte instalada).
# Uso: python gerar.py  (lê a fonte de ../tipografia; outra pasta pode ser passada como argumento)
# Proporções iguais às da identidade v3: símbolo com 1,47× a altura da fonte, espaço de 0,4× a fonte,
# nome em Plus Jakarta Sans 800 itálico, espaçamento −0,035 em, "SC" em degradê e "Explorer" sólido.
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

AQUI = os.path.dirname(os.path.abspath(__file__))
FONTES = sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, '..', 'tipografia')
SAIDA = os.path.join(AQUI, 'svg')
os.makedirs(SAIDA, exist_ok=True)

fonte = instantiateVariableFont(TTFont(os.path.join(FONTES, 'PlusJakartaSans-Italic[wght].ttf')), {'wght': 800})
gs = fonte.getGlyphSet(); cmap = fonte.getBestCmap(); upm = fonte['head'].unitsPerEm
hmtx = fonte['hmtx']; cap = fonte['OS/2'].sCapHeight

# kerning de pares (GPOS, formato 1 e 2) para ficar igual ao navegador
def kerning():
    k = {}
    if 'GPOS' not in fonte: return k
    for lk in fonte['GPOS'].table.LookupList.Lookup:
        if lk.LookupType not in (2, 9): continue
        for st in lk.SubTable:
            if lk.LookupType == 9: st = st.ExtSubTable
            if getattr(st, 'LookupType', 2) != 2: continue
            if st.Format == 1:
                for i, g1 in enumerate(st.Coverage.glyphs):
                    for pv in st.PairSet[i].PairValueRecord:
                        v = getattr(pv.Value1, 'XAdvance', 0) if pv.Value1 else 0
                        if v: k.setdefault((g1, pv.SecondGlyph), v)
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs; c2 = st.ClassDef2.classDefs
                for g1 in st.Coverage.glyphs:
                    r = st.Class1Record[c1.get(g1, 0)]
                    for g2 in set(cmap.values()):
                        rec = r.Class2Record[c2.get(g2, 0)]
                        v = getattr(rec.Value1, 'XAdvance', 0) if rec.Value1 else 0
                        if v: k.setdefault((g1, g2), v)
    return k
KERN = kerning()

def texto(s, fs, x, base, espac=-0.035):
    """Devolve (path d, x final) do texto s no tamanho fs com a linha de base em `base`."""
    esc = fs / upm; d = []; ant = None
    for ch in s:
        g = cmap[ord(ch)]
        if ant: x += KERN.get((ant, g), 0) * esc
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (esc, 0, 0, -esc, x, base)))
        d.append(pen.getCommands())
        x += hmtx[g][0] * esc + espac * fs; ant = g
    return ' '.join(p for p in d if p), x - espac * fs

def limites(s, fs, x, base):
    bp = BoundsPen(gs); esc = fs / upm; ant = None
    for ch in s:
        g = cmap[ord(ch)]
        if ant: x += KERN.get((ant, g), 0) * esc
        gs[g].draw(TransformPen(bp, (esc, 0, 0, -esc, x, base)))
        x += hmtx[g][0] * esc - 0.035 * fs; ant = g
    return bp.bounds

PALETA = {
    'escuro': dict(g1='#1FE0BE', g2='#46C2FF', nome='#FFFFFF'),
    'claro': dict(g1='#0B9C86', g2='#1C7FD1', nome='#0A1B2E'),
    'branco': dict(g1='#FFFFFF', g2='#FFFFFF', nome='#FFFFFF', sol='#FFFFFF'),
    'preto': dict(g1='#0A1B2E', g2='#0A1B2E', nome='#0A1B2E', sol='#0A1B2E'),
}
SIMB_TRACO = 'M8 52 C24 52 33 22 46 13 C53 8 58 25 65 30 C70 26 75 20 82 21 C92 23 98 46 110 48 C116 49 120 46 122 43'
SIMB_ONDA = 'M24 63 C38 59 52 66 66 63 C80 60 94 59 108 63'

def defs(p, id_, sol=True):
    s = f'<linearGradient id="{id_}-t" x1="8" y1="0" x2="122" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{p["g1"]}"/><stop offset="1" stop-color="{p["g2"]}"/></linearGradient>'
    if sol and 'sol' not in p:
        s += f'<linearGradient id="{id_}-s" x1="0" y1="9" x2="0" y2="23" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFD166"/><stop offset="1" stop-color="#FF7A59"/></linearGradient>'
    return s

def simbolo(p, id_, tf=''):
    sol = p.get('sol', f'url(#{id_}-s)')
    return (f'<g{f" transform=\"{tf}\"" if tf else ""}><circle cx="100" cy="16" r="5.5" fill="{sol}"/>'
            f'<path d="{SIMB_TRACO}" fill="none" stroke="url(#{id_}-t)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{SIMB_ONDA}" fill="none" stroke="url(#{id_}-t)" stroke-width="3.5" stroke-linecap="round" opacity=".55"/></g>')

def svg(w, h, corpo, titulo):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{titulo}">'
            f'<title>{titulo}</title>{corpo}</svg>\n')

def gravar(nome, conteudo):
    with open(os.path.join(SAIDA, nome), 'w', encoding='utf-8', newline='\n') as f: f.write(conteudo)
    print('ok', nome)

# ---- símbolo (128 × 72, com respiro de 8) ----
for k, p in PALETA.items():
    gravar(f'simbolo-{k}.svg', svg(144, 88, f'<defs>{defs(p, "m")}</defs>{simbolo(p, "m", "translate(8 8)")}', 'SC Explorer'))

# ---- assinatura horizontal ----
FS = 100.0
def assinatura(p, vertical=False):
    if not vertical:
        sh = FS * 1.4667; sw = sh * 128 / 72; gap = FS * 0.4
        x0 = sw + gap
        base = sh / 2 + cap * FS / upm / 2  # centro óptico: meio da altura de maiúscula = meio do símbolo
    else:
        sw = FS * 3.0; sh = sw * 72 / 128; x0 = 0; base = sh + FS * 0.30 + cap * FS / upm
    dSC, xSC = texto('SC', FS, x0, base)
    dEx, xF = texto(' Explorer', FS, xSC, base)
    b1 = limites('SC', FS, x0, base); b2 = limites(' Explorer', FS, xSC, base)
    larg_txt = max(b2[2], xF) - x0
    if vertical:  # centraliza o símbolo sobre o nome
        desl = (larg_txt - sw) / 2
        if desl < 0:
            dSC, xSC = texto('SC', FS, -desl, base); dEx, xF = texto(' Explorer', FS, xSC, base)
            b1 = limites('SC', FS, -desl, base); b2 = limites(' Explorer', FS, xSC, base); desl = 0; larg_txt = sw
        simb = simbolo(p, 'a', f'translate({desl:.2f} 0) scale({sw / 128:.4f})')
        W = max(sw, b2[2]); H = max(b1[3], b2[3])
    else:
        simb = simbolo(p, 'a', f'scale({sh / 72:.4f})')
        W = b2[2]; H = max(sh, b1[3], b2[3])
    m = FS * 0.25  # respiro
    grad = f'<linearGradient id="a-sc" x1="{b1[0]:.1f}" y1="0" x2="{b1[2]:.1f}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{p["g1"]}"/><stop offset="1" stop-color="{p["g2"]}"/></linearGradient>'
    corpo = (f'<defs>{defs(p, "a")}{grad}</defs><g transform="translate({m:.1f} {m:.1f})">{simb}'
             f'<path d="{dSC}" fill="url(#a-sc)"/><path d="{dEx}" fill="{p["nome"]}"/></g>')
    return svg(W + 2 * m, H + 2 * m, corpo, 'SC Explorer')

for k, p in PALETA.items():
    gravar(f'assinatura-horizontal-{k}.svg', assinatura(p))
    gravar(f'assinatura-vertical-{k}.svg', assinatura(p, vertical=True))

# ---- ícone do app (cantos arredondados) e versão para máscara (fundo inteiro, símbolo na zona segura) ----
fundo = '<radialGradient id="f" cx="30%" cy="0%" r="110%"><stop offset="0" stop-color="#164369"/><stop offset=".72" stop-color="#06111F"/></radialGradient>'
p = PALETA['escuro']
gravar('icone-app.svg', svg(512, 512, f'<defs>{fundo}{defs(p, "i")}</defs><rect width="512" height="512" rx="112" fill="url(#f)"/>{simbolo(p, "i", "translate(64 140) scale(3)")}', 'SC Explorer'))
gravar('icone-app-mascara.svg', svg(512, 512, f'<defs>{fundo}{defs(p, "i")}</defs><rect width="512" height="512" fill="url(#f)"/>{simbolo(p, "i", "translate(102 168) scale(2.4)")}', 'SC Explorer'))
