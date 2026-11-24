// Função agendada da Netlify: coleta clima, mar, maré, trânsito e avisos a cada 12 minutos.
import { coletar } from '../lib/coletor.mjs';

export default async () => {
  try {
    await coletar(process.env, { log: (r) => console.log('coleta', JSON.stringify(r)) });
  } catch (e) {
    console.error('coleta falhou', e);
  }
};

export const config = { schedule: '*/12 * * * *' };
