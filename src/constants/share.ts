/**
 * Cards de compartilhamento (botão de sequência no dashboard) — formato
 * Stories (9:16), tamanho de exportação em pixels físicos. Margens de
 * segurança verticais são assimétricas de propósito: o TikTok tem uma
 * barra de ações pesada na base (curtir/comentar/compartilhar), bem mais
 * invasiva que a barra superior — conteúdo importante precisa ficar dentro
 * da faixa central pra não ficar coberto ao publicar.
 */

export const SHARE_CARD_EXPORT_WIDTH = 1080;
export const SHARE_CARD_EXPORT_HEIGHT = 1920;

export const SHARE_SAFE_MARGIN_TOP_RATIO = 0.13;
export const SHARE_SAFE_MARGIN_BOTTOM_RATIO = 0.21;
export const SHARE_SAFE_MARGIN_SIDE_RATIO = 0.09;
