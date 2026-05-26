/**
 * Ošetří text před vložením do HTML.
 * Nahrazuje speciální znaky za HTML entity, aby se zabránilo nechtěnému
 * vykreslení HTML kódu nebo vložení nebezpečného obsahu uživatelem.
 *
 * @param {*} value - Hodnota, která se má bezpečně převést na text.
 * @returns {string} Bezpečný text vhodný pro vložení do HTML.
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}