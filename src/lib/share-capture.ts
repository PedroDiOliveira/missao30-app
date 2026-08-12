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
  if (!available) throw new Error('Compartilhamento não disponível neste dispositivo');
  await Sharing.shareAsync(fileUri, {
    mimeType: 'image/png',
    UTI: 'public.png',
    dialogTitle: 'Compartilhar',
  });
}
