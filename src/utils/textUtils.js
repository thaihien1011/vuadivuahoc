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
