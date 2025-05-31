/**
 * Normalize a string by removing accents and converting to lowercase.
 * This helps with case-insensitive and accent-insensitive matching.
 * @param {string} text - The input string to normalize.
 * @returns {string} - The normalized string.
 */
function normalizeText(text) {
  if (!text) return "";

  // Normalize the string to Unicode NFD form, which separates accents from letters
  // Then remove all accent marks using a regex that matches combining diacritical marks
  // Finally, convert the string to lowercase
  return text
    .normalize("NFD") // Decompose accents from characters
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
