# Missão30 — App

Aplicativo mobile de bem-estar e desenvolvimento pessoal que transforma metas vagas e contínuas em desafios fechados de 30 dias, com tolerância a falhas por design e check-in de um toque.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando o projeto](#executando-o-projeto)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Estado atual](#estado-atual)
- [Documentação](#documentação)

## Sobre o projeto

O Missão30 parte da premissa de que hábitos "para sempre" falham porque a pressão de um compromisso sem fim, somada à rigidez de "um dia perdido é tudo perdido", leva ao abandono. Em vez disso, o app propõe missões temporárias de 30 dias, cada uma com um número limitado de faltas permitidas, para que um deslize pontual não signifique o fim do progresso.

O usuário pode manter mais de uma missão ativa ao mesmo tempo, cada uma em uma categoria (estudos, treino, sono ou finanças), acompanhando o progresso de todas a partir de um painel central com check-in direto, sem precisar navegar para telas intermediárias.

Este repositório contém o cliente mobile do produto. O backend (Supabase) e o contexto de produto completo vivem em repositórios e documentos separados — veja [Documentação](#documentação).

## Stack tecnológica

- **React Native** com **Expo** (Managed Workflow, Expo Router, TypeScript)
- **react-native-svg** e **lucide-react-native** para iconografia
- **react-native-reanimated** para animações
- **Supabase** (Postgres, Auth, Row Level Security) como backend de destino — ainda não conectado nesta fase do desenvolvimento

## Pré-requisitos

- Node.js (testado com a versão 22)
- npm
- Aplicativo Expo Go instalado no celular (opcional, para testar em dispositivo físico) ou um simulador iOS/Android configurado

## Instalação

```bash
npm install
```

## Executando o projeto

```bash
npx expo start
```

O terminal exibirá as opções para abrir o app:

- em um simulador iOS ou emulador Android
- no Expo Go, escaneando o QR code exibido
- no navegador, com `npx expo start --web`

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento (Metro) |
| `npm run ios` | Inicia e abre no simulador iOS |
| `npm run android` | Inicia e abre no emulador Android |
| `npm run web` | Inicia e abre no navegador |
| `npm run lint` | Roda o ESLint sobre o projeto |

## Estrutura do projeto

```
src/
  app/            rotas do Expo Router (file-based routing)
  components/      componentes de UI, organizados por domínio
  context/         camadas de dados compartilhadas entre telas
  hooks/           hooks reutilizáveis
  lib/             lógica de negócio pura, tipos e dados
  constants/       tokens de tema, espaçamento e limites do produto
```

Cada tela em `src/app` corresponde a uma rota; a lógica de negócio (cálculo de progresso, faltas e estatísticas) fica isolada em `src/lib`, desacoplada da camada visual.

## Estado atual

O projeto está em fase de construção do front-end sobre dados simulados, antes da integração com o backend real. Toda a interface é funcional e navegável, mas os dados exibidos vêm de um conjunto de cenários mockados (`src/lib/mock-data.ts`), não de um banco de dados. A camada de dados foi desenhada para que essa troca, quando ocorrer, altere apenas a origem dos dados — não as telas.

## Documentação

O contexto completo do produto — filosofia, decisões já tomadas, modelo de dados, regras de negócio e arquitetura do backend — está centralizado em `CONTEXT.md`, na raiz do projeto (`../CONTEXT.md` a partir deste repositório). Esse documento é a referência canônica para qualquer decisão de produto ou técnica; este README cobre apenas o essencial para rodar e navegar o código deste repositório.
