import { Redirect } from 'expo-router';

// Auth ainda não está ligado nesta fase (fase de mock, front-first — ver
// CLAUDE.md/CONTEXT.md). Quando entrar, este ponto passa a checar sessão e
// decidir entre /auth e /home. Por enquanto vai direto pra /home, que por
// sua vez decide entre se mostrar ou redirecionar pro catálogo/relatório
// (CONTEXT.md Seção 7).
export default function Index() {
  return <Redirect href="/home" />;
}
