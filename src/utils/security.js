// Helpers for keeping submissions anonymous and well-formed.

export const MAX_TEXT = 1000;

// Light cleanup only. React escapes output, so we do not mangle the text
// (no stripping of quotes or "on...=" patterns, which broke normal writing).
export const cleanText = (input, max = MAX_TEXT) => {
  if (typeof input !== 'string') return '';
  return input
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
};

export const isValidScore = (n) => Number.isInteger(n) && n >= 1 && n <= 5;
