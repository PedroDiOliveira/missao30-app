/**
 * Geração/exportação dos cards de compartilhamento — funções puras, sem
 * JSX. `captureCardAsFile` é o único lugar que sabe como o PNG é gerado
 * (hoje via `react-native-view-shot`); `shareCardFile` só recebe um URI de
 * arquivo, então se o mecanismo de captura mudar (ex.: fallback pra
 * `@shopify/react-native-skia`, ver plano), só `captureCardAsFile` muda por
 * dentro.
 */

import * as Sharing from 'expo-sharing';
import { captureRef, type ViewShotRef } from 'react-native-view-shot';

import { SHARE_CARD_EXPORT_HEIGHT, SHARE_CARD_EXPORT_WIDTH } from '@/constants/share';

/**
 * Erro distinto (em vez de um `Error` genérico) pra quem chama poder dar um
 * aviso diferente — isso não é uma falha transitória que "tentar de novo"
 * resolve: o navegador/dispositivo atual simplesmente não tem bandeja de
 * compartilhamento nativa (ex.: preview web em navegador sem suporte à Web
 * Share API, ou `http://` sem contexto seguro).
 */
export class SharingUnavailableError extends Error {}

export async function captureCardAsFile(cardRef: React.RefObject<ViewShotRef | null>): Promise<string> {
  if (!cardRef.current) throw new Error('Card de compartilhamento ainda não está pronto');
  return captureRef(cardRef.current, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    width: SHARE_CARD_EXPORT_WIDTH,
    height: SHARE_CARD_EXPORT_HEIGHT,
  });
}

export async function shareCardFile(fileUri: string): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new SharingUnavailableError('Compartilhamento não disponível neste navegador/dispositivo');
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    UTI: 'public.png',
    dialogTitle: 'Compartilhar',
  });
}
