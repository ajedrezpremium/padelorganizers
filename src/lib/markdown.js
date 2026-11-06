// src/lib/markdown.js
// Renderizador Markdown seguro (XSS-safe) usado por PadelCoach AI.

export function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderMd(text) {
  let out = escapeHtml(text || '');
  // bold
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  out = out.replace(/_(.+?)_/g, '<em>$1</em>');
  // code inline
  out = out.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.15);padding:1px 4px;border-radius:4px">$1</code>');
  // saltos de línea
  out = out.replace(/\n/g, '<br />');
  return out;
}
