/**
 * Conteúdo estático por categoria pro card de dicas do dashboard.
 * 100% client-side, sem tabela no banco — mesma filosofia já aplicada à
 * grade de 30 dias (CONTEXT.md Seção 7): não gastar uma ida ao servidor
 * com algo que pode ser estático.
 */

import type { MissionCategory } from '@/lib/types';

export const CATEGORY_TIPS: Record<MissionCategory, string[]> = {
  study: [
    'Estude sempre no mesmo horário — o cérebro cria o hábito mais rápido com repetição de contexto.',
    'Prefira sessões curtas e frequentes a maratonas de última hora.',
  ],
  fitness: [
    'Separe a roupa de treino na noite anterior — reduz a fricção de começar.',
    'Um treino curto feito vale mais que um treino perfeito adiado.',
  ],
  sleep: [
    'Luz de tela antes de dormir atrasa o sono — tente uma tela a menos hoje.',
    'Um horário fixo pra deitar ajuda mais que a duração da noite isolada.',
  ],
  finance: [
    'Anotar o gasto na hora, por menor que seja, evita o efeito "some do bolso".',
    'Revise seus gastos da semana num dia fixo — vira hábito mais rápido que revisão aleatória.',
  ],
};

export function getCategoryTip(category: MissionCategory): string {
  const tips = CATEGORY_TIPS[category];
  return tips[Math.floor(Math.random() * tips.length)];
}
