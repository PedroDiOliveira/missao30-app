/**
 * Utilitários de data local — CONTEXT.md Seção 7: sempre a data local do
 * dispositivo do usuário (YYYY-MM-DD), nunca UTC bruto do servidor.
 */

export function todayLocal(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function toLocalDateString(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
}

export function addDays(base: string, n: number): string {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toLocalDateString(d);
}
