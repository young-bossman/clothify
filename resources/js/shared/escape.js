/**
 * shared/escape.js
 * ─────────────────────────────────────────────
 * Single escaping helper for every page that builds
 * markup with innerHTML template strings.
 *
 * Lives here rather than per-feature so the dashboard and
 * products renderers cannot drift apart — a second copy is
 * a second place to forget a character.
 */

/**
 * Escape a value for safe interpolation into an innerHTML string.
 *
 * Only needed for innerHTML. Values assigned via textContent or
 * setAttribute are already inert and must NOT be double-escaped,
 * or the user sees literal &amp; in the UI.
 *
 * Null and undefined collapse to an empty string so callers can
 * pass optional fields straight through.
 */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
}[char]));
