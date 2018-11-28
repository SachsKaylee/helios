/**
 * Escapes a potentially unsafe string to RegExp usage.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param {string} string The string to escape.
 */
const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

module.exports = escapeRegExp;
