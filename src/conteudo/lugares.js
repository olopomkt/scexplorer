// Base inicial de lugares (23/11/2026): só lugares conhecidos e reais da Ilha, sem horário nem preço
// (isso ainda não foi conferido). Coordenadas aproximadas, usadas só para o mapa e para a distância
// entre paradas do roteiro; o "Cómo llegar" abre o Google Maps pelo NOME, não pela coordenada.
// Próxima etapa: completar pela OpenStreetMap e o dono revisar (docs/DICAS-E-LOCAIS.md §4).
//
// popularidade (0–1) e mar ('aberto' | 'baia') alimentam a estimativa de lotação: fórmula inicial,
// a calibrar com a observação do dono. Não é medição.

export const REGIOES = {
  norte: { es: 'Norte', pt: 'Norte', en: 'North' },
  leste: { es: 'Este', pt: 'Leste', en: 'East' },
  sul: { es: 'Sur', pt: 'Sul', en: 'South' },
  centro: { es: 'Centro y bahías', pt: 'Centro e baías', en: 'Downtown & bays' },
};

export const PRAIAS = [
  { id: 'jurere', nome: 'Jurerê Internacional', regiao: 'norte', lat: -27.4400, lon: -48.4990, mar: 'baia', pop: 1, foto: 'praiaMov', tags: ['familia', 'agitado'],
    txt: { es: 'Playa de bahía, agua calma y mucho movimiento.', pt: 'Praia de baía, mar calmo e muito movimento.', en: 'Bay beach with calm water and lots going on.' } },
  { id: 'canasvieiras', nome: 'Canasvieiras', regiao: 'norte', lat: -27.4270, lon: -48.4620, mar: 'baia', pop: 1, foto: 'ensDia', tags: ['familia'],
    txt: { es: 'Mar calmo y playo, ideal para chicos.', pt: 'Mar calmo e raso, boa para crianças.', en: 'Calm, shallow water, good for kids.' } },
  { id: 'ingleses', nome: 'Ingleses', regiao: 'norte', lat: -27.4340, lon: -48.3950, mar: 'aberto', pop: 0.95, foto: 'ensPor', tags: ['familia', 'agitado'],
    txt: { es: 'Playa larga de mar abierto, con dunas en el sur.', pt: 'Praia longa de mar aberto, com dunas no canto sul.', en: 'Long open-sea beach with dunes at the south end.' } },
  { id: 'santinho', nome: 'Santinho', regiao: 'norte', lat: -27.4620, lon: -48.3770, mar: 'aberto', pop: 0.7, foto: 'costao', tags: ['surf'],
    txt: { es: 'Mar abierto, olas para surf.', pt: 'Mar aberto, ondas para surfe.', en: 'Open sea with surfable waves.' } },
  { id: 'brava', nome: 'Praia Brava', regiao: 'norte', lat: -27.3990, lon: -48.4140, mar: 'aberto', pop: 0.7, foto: 'costao', tags: ['surf'],
    txt: { es: 'Mar abierto y olas fuertes, entre morros.', pt: 'Mar aberto e ondas fortes, entre morros.', en: 'Open sea and strong waves between hills.' } },
  { id: 'daniela', nome: 'Daniela', regiao: 'norte', lat: -27.4520, lon: -48.5320, mar: 'baia', pop: 0.55, foto: 'ensDia', tags: ['tranquilo', 'familia'],
    txt: { es: 'Bahía tranquila, agua calma.', pt: 'Baía tranquila, água calma.', en: 'Quiet bay with calm water.' } },
  { id: 'mocambique', nome: 'Moçambique', regiao: 'leste', lat: -27.5100, lon: -48.4100, mar: 'aberto', pop: 0.5, foto: 'trilha', tags: ['tranquilo', 'surf'],
    txt: { es: 'La playa más larga de la Isla, rodeada de verde.', pt: 'A praia mais longa da Ilha, cercada de mata.', en: 'The longest beach on the Island, surrounded by forest.' } },
  { id: 'barra', nome: 'Barra da Lagoa', regiao: 'leste', lat: -27.5740, lon: -48.4230, mar: 'aberto', pop: 0.8, foto: 'costao', tags: ['familia', 'gastronomico'],
    txt: { es: 'Pueblo de pescadores, canal y playa abierta.', pt: 'Vila de pescadores, canal e praia aberta.', en: 'Fishing village with a canal and an open beach.' } },
  { id: 'mole', nome: 'Praia Mole', regiao: 'leste', lat: -27.6020, lon: -48.4330, mar: 'aberto', pop: 0.85, foto: 'ensDia', tags: ['surf', 'agitado'],
    txt: { es: 'Surf y senderos, mar abierto.', pt: 'Surfe e trilhas, mar aberto.', en: 'Surf and trails, open sea.' } },
  { id: 'joaquina', nome: 'Joaquina', regiao: 'leste', lat: -27.6290, lon: -48.4490, mar: 'aberto', pop: 0.9, foto: 'praiaMov', tags: ['surf', 'aventura'],
    txt: { es: 'Playa de surf al lado de las dunas.', pt: 'Praia de surfe ao lado das dunas.', en: 'Surf beach next to the dunes.' } },
  { id: 'campeche', nome: 'Campeche', regiao: 'sul', lat: -27.6750, lon: -48.4790, mar: 'aberto', pop: 0.85, foto: 'trilha', tags: ['surf'],
    txt: { es: 'Playa larga de mar abierto, frente a la Isla do Campeche.', pt: 'Praia longa de mar aberto, de frente para a Ilha do Campeche.', en: 'Long open-sea beach facing Campeche Island.' } },
  { id: 'morrodaspedras', nome: 'Morro das Pedras', regiao: 'sul', lat: -27.7150, lon: -48.5020, mar: 'aberto', pop: 0.45, foto: 'costao', tags: ['tranquilo'],
    txt: { es: 'Mar fuerte, mejor para mirar que para bañarse.', pt: 'Mar forte, melhor para olhar do que para banho.', en: 'Rough sea, better for the view than for swimming.' } },
  { id: 'armacao', nome: 'Armação', regiao: 'sul', lat: -27.7480, lon: -48.5040, mar: 'aberto', pop: 0.7, foto: 'ensPor', tags: ['familia'],
    txt: { es: 'Pueblo de pescadores y salida al Matadeiro.', pt: 'Vila de pescadores e caminho para o Matadeiro.', en: 'Fishing village and the way to Matadeiro.' } },
  { id: 'matadeiro', nome: 'Matadeiro', regiao: 'sul', lat: -27.7550, lon: -48.4990, mar: 'aberto', pop: 0.55, foto: 'trilha', tags: ['aventura', 'surf'],
    txt: { es: 'Se llega caminando desde Armação.', pt: 'Chega-se a pé a partir da Armação.', en: 'Reached on foot from Armação.' } },
  { id: 'lagoinhadoleste', nome: 'Lagoinha do Leste', regiao: 'sul', lat: -27.7740, lon: -48.4850, mar: 'aberto', pop: 0.4, foto: 'trilha', tags: ['aventura'],
    txt: { es: 'Solo por sendero: llevá agua y salí temprano.', pt: 'Só por trilha: leve água e saia cedo.', en: 'Trail access only: bring water and start early.' } },
  { id: 'pantano', nome: 'Pântano do Sul', regiao: 'sul', lat: -27.7820, lon: -48.5100, mar: 'baia', pop: 0.5, foto: 'ensPor', tags: ['tranquilo', 'gastronomico'],
    txt: { es: 'Playa de pescadores, ambiente tranquilo.', pt: 'Praia de pescadores, clima tranquilo.', en: 'Fishermen’s beach with a quiet feel.' } },
  { id: 'santoantonio', nome: 'Santo Antônio de Lisboa', regiao: 'centro', lat: -27.5080, lon: -48.5200, mar: 'baia', pop: 0.5, foto: 'ensPor', tags: ['romantico', 'gastronomico'],
    txt: { es: 'Bahía con casas antiguas, ostras y atardecer.', pt: 'Baía com casario antigo, ostras e pôr do sol.', en: 'Bay with old houses, oysters and sunsets.' } },
  { id: 'ribeirao', nome: 'Ribeirão da Ilha', regiao: 'centro', lat: -27.7180, lon: -48.5650, mar: 'baia', pop: 0.4, foto: 'ensDia', tags: ['tranquilo', 'gastronomico'],
    txt: { es: 'Pueblo colonial frente a la bahía sur, famoso por las ostras.', pt: 'Vila colonial na baía sul, famosa pelas ostras.', en: 'Colonial village on the south bay, known for oysters.' } },
];

// Outros lugares (passeio, mirante, cultura, gastronomia, compras). chuva = funciona com chuva.
export const LUGARES = [
  { id: 'mercado', nome: 'Mercado Público', tipo: 'gastronomia', regiao: 'centro', lat: -27.5970, lon: -48.5520, chuva: true, foto: 'centro', momentos: ['almoco', 'tarde'],
    txt: { es: 'Gastronomía y artesanías en el centro histórico.', pt: 'Gastronomia e artesanato no centro histórico.', en: 'Food and crafts in the historic center.' } },
  { id: 'museu', nome: 'Museu Histórico de Santa Catarina', tipo: 'cultura', regiao: 'centro', lat: -27.5960, lon: -48.5490, chuva: true, foto: 'centro', momentos: ['manha', 'tarde'],
    txt: { es: 'En el Palacio Cruz e Sousa, frente a la Plaza XV.', pt: 'No Palácio Cruz e Sousa, em frente à Praça XV.', en: 'In the Cruz e Sousa Palace, facing Praça XV.' } },
  { id: 'pracaxv', nome: 'Praça XV de Novembro', tipo: 'passeio', regiao: 'centro', lat: -27.5964, lon: -48.5494, chuva: false, foto: 'centro', momentos: ['manha', 'tarde'],
    txt: { es: 'La plaza central, con la higuera centenaria.', pt: 'A praça central, com a figueira centenária.', en: 'The main square with the century-old fig tree.' } },
  { id: 'hercilioluz', nome: 'Ponte Hercílio Luz', tipo: 'mirante', regiao: 'centro', lat: -27.5940, lon: -48.5600, chuva: false, foto: 'avenida', momentos: ['tarde', 'por', 'noite'],
    txt: { es: 'La postal de la ciudad, linda iluminada de noche.', pt: 'O cartão-postal da cidade, bonita iluminada à noite.', en: 'The city’s postcard, lovely when lit up at night.' } },
  { id: 'beiramar', nome: 'Beira-Mar Norte', tipo: 'passeio', regiao: 'centro', lat: -27.5830, lon: -48.5470, chuva: false, foto: 'beiraNoite', momentos: ['manha', 'por', 'noite'],
    txt: { es: 'Costanera para caminar, correr o andar en bici.', pt: 'Orla para caminhar, correr ou pedalar.', en: 'Waterfront path for walking, running or cycling.' } },
  { id: 'mirantelagoa', nome: 'Mirante da Lagoa', tipo: 'mirante', regiao: 'leste', lat: -27.5960, lon: -48.4800, chuva: false, foto: 'trilha', momentos: ['manha', 'tarde'],
    txt: { es: 'Vista de la Lagoa da Conceição desde el morro.', pt: 'Vista da Lagoa da Conceição do alto do morro.', en: 'View over Lagoa da Conceição from the hill.' } },
  { id: 'lagoacentro', nome: 'Centrinho da Lagoa', tipo: 'gastronomia', regiao: 'leste', lat: -27.6010, lon: -48.4710, chuva: true, foto: 'ensPor', momentos: ['almoco', 'noite'],
    txt: { es: 'Restaurantes y bares a orillas de la Lagoa.', pt: 'Restaurantes e bares na beira da Lagoa.', en: 'Restaurants and bars on the edge of the Lagoa.' } },
  { id: 'costadalagoa', nome: 'Costa da Lagoa (barco)', tipo: 'passeio', regiao: 'leste', lat: -27.5800, lon: -48.4680, chuva: false, foto: 'ensDia', momentos: ['manha', 'tarde'],
    txt: { es: 'Se llega en barco desde la Lagoa: comunidad y restaurantes.', pt: 'Chega-se de barco pela Lagoa: comunidade e restaurantes.', en: 'Reached by boat across the Lagoa: a village with restaurants.' } },
  { id: 'dunas', nome: 'Dunas da Joaquina', tipo: 'aventura', regiao: 'leste', lat: -27.6250, lon: -48.4520, chuva: false, foto: 'praiaMov', momentos: ['manha', 'tarde'],
    txt: { es: 'Dunas para caminar y hacer sandboard.', pt: 'Dunas para caminhar e fazer sandboard.', en: 'Dunes for walking and sandboarding.' } },
  { id: 'fortaleza', nome: 'Fortaleza de São José da Ponta Grossa', tipo: 'cultura', regiao: 'norte', lat: -27.4290, lon: -48.5290, chuva: false, foto: 'costao', momentos: ['manha', 'tarde'],
    txt: { es: 'Fortaleza del siglo XVIII con vista al mar.', pt: 'Fortaleza do século XVIII com vista para o mar.', en: '18th-century fortress overlooking the sea.' } },
  { id: 'trilhalagoinha', nome: 'Trilha da Lagoinha do Leste', tipo: 'trilha', regiao: 'sul', lat: -27.7770, lon: -48.4960, chuva: false, foto: 'trilha', momentos: ['manha'],
    txt: { es: 'Sendero exigente hasta una playa salvaje. Llevá agua.', pt: 'Trilha puxada até uma praia selvagem. Leve água.', en: 'Demanding trail to a wild beach. Bring water.' } },
  { id: 'ostrasribeirao', nome: 'Ostras no Ribeirão da Ilha', tipo: 'gastronomia', regiao: 'centro', lat: -27.7180, lon: -48.5650, chuva: true, foto: 'ensDia', momentos: ['almoco', 'por'],
    txt: { es: 'Restaurantes frente a la bahía, con ostras de la región.', pt: 'Restaurantes de frente para a baía, com ostras da região.', en: 'Bayfront restaurants serving local oysters.' } },
  { id: 'ostrassantoantonio', nome: 'Santo Antônio de Lisboa', tipo: 'gastronomia', regiao: 'centro', lat: -27.5080, lon: -48.5200, chuva: true, foto: 'ensPor', momentos: ['almoco', 'por', 'noite'], oeste: true,
    txt: { es: 'Atardecer sobre la bahía y restaurantes de mariscos.', pt: 'Pôr do sol sobre a baía e restaurantes de frutos do mar.', en: 'Sunset over the bay and seafood restaurants.' } },
  { id: 'shoppingbeiramar', nome: 'Beiramar Shopping', tipo: 'compras', regiao: 'centro', lat: -27.5920, lon: -48.5470, chuva: true, foto: 'beiraNoite', momentos: ['tarde', 'noite'],
    txt: { es: 'Shopping en el centro, cerca de la Beira-Mar.', pt: 'Shopping no centro, perto da Beira-Mar.', en: 'Mall downtown, close to Beira-Mar.' } },
  { id: 'floripashopping', nome: 'Floripa Shopping', tipo: 'compras', regiao: 'norte', lat: -27.5530, lon: -48.4990, chuva: true, foto: 'beiraNoite', momentos: ['tarde', 'noite'],
    txt: { es: 'Shopping sobre la SC-401, camino al norte.', pt: 'Shopping na SC-401, a caminho do norte.', en: 'Mall on SC-401, on the way north.' } },
];

export const TIPOS = {
  praia: { es: 'Playa', pt: 'Praia', en: 'Beach', ic: 'guarda' },
  mirante: { es: 'Mirador', pt: 'Mirante', en: 'Viewpoint', ic: 'montanha' },
  trilha: { es: 'Sendero', pt: 'Trilha', en: 'Trail', ic: 'montanha' },
  gastronomia: { es: 'Gastronomía', pt: 'Gastronomia', en: 'Food', ic: 'talher' },
  cultura: { es: 'Cultura', pt: 'Cultura', en: 'Culture', ic: 'predio' },
  passeio: { es: 'Paseo', pt: 'Passeio', en: 'Stroll', ic: 'camera' },
  aventura: { es: 'Aventura', pt: 'Aventura', en: 'Adventure', ic: 'bandeira' },
  compras: { es: 'Compras', pt: 'Compras', en: 'Shopping', ic: 'sacola' },
};

export const praia = (id) => PRAIAS.find((p) => p.id === id);
export const distKm = (a, b) => Math.hypot((a.lat - b.lat) * 111.2, (a.lon - b.lon) * 98.6);
