/**
 * Frase do dia — substitui as dicas por categoria (que dependiam de ter
 * uma missão ativa) por um conteúdo mais amplo: citações reais, com
 * atribuição correta, cobrindo motivação, saúde mental/performance e
 * progresso na vida. 100% estático, sem tabela no banco (mesma filosofia
 * já aplicada à grade de 30 dias — CONTEXT.md Seção 7).
 *
 * A seleção é determinística por data (não aleatória a cada render): todo
 * mundo vê a mesma frase no mesmo dia, e ela só muda amanhã.
 */

import { todayLocal } from '@/lib/date';

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: 'A jornada de mil quilômetros começa com um único passo.', author: 'Lao Tzu' },
  { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Robert Collier' },
  { text: 'Disciplina é a ponte entre metas e conquistas.', author: 'Jim Rohn' },
  { text: 'Não conte os dias, faça os dias contarem.', author: 'Muhammad Ali' },
  { text: 'A motivação é o que faz você começar. O hábito é o que faz você continuar.', author: 'Jim Ryun' },
  { text: 'Você não precisa ser grande para começar, mas precisa começar para ser grande.', author: 'Zig Ziglar' },
  { text: 'Cuide do seu corpo. É o único lugar que você tem para viver.', author: 'Jim Rohn' },
  {
    text: 'A saúde mental não é um destino, mas um processo. É sobre como você dirige, não para onde vai.',
    author: 'Noam Shpancer',
  },
  {
    text: 'Você não pode voltar atrás e mudar o começo, mas pode começar onde está e mudar o final.',
    author: 'C.S. Lewis',
  },
  {
    text: 'Fracasso é apenas a oportunidade de recomeçar de novo, desta vez de forma mais inteligente.',
    author: 'Henry Ford',
  },
  { text: 'Aquilo que não me mata, me fortalece.', author: 'Friedrich Nietzsche' },
  { text: 'A qualidade não é um ato, é um hábito.', author: 'Aristóteles' },
  { text: 'Comece onde você está. Use o que você tem. Faça o que você pode.', author: 'Arthur Ashe' },
  { text: 'Tudo parece impossível até que seja feito.', author: 'Nelson Mandela' },
  { text: 'O que não é medido não é gerenciado.', author: 'Peter Drucker' },
  { text: 'A persistência é o caminho do êxito.', author: 'Charles Chaplin' },
];

export function getQuoteOfTheDay(today: string = todayLocal()): Quote {
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % QUOTES.length;
  }
  return QUOTES[Math.abs(hash) % QUOTES.length];
}
