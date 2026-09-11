/**
 * Removes Vietnamese diacritics/tones and spaces from a string.
 * Used for usernames and passwords to prevent Vietnamese IME typing errors.
 */
export const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, '');
};

/**
 * Normalizes Vietnamese text by converting to lowercase, stripping diacritics/accents, 
 * and preserving spaces for flexible NLP & fuzzy search matching.
 */
export const normalizeVietnameseText = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/ê/g, 'e')
    .replace(/ô/g, 'o')
    .replace(/ơ/g, 'o')
    .replace(/ư/g, 'u')
    .replace(/ỳ/g, 'y')
    .replace(/ý/g, 'y')
    .replace(/ỵ/g, 'y')
    .replace(/ỷ/g, 'y')
    .replace(/ỹ/g, 'y')
    .trim();
};
