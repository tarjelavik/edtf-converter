const getValidDateFromString = require('./get-valid-date-from-string');
const datePrecision = require('./date-precision');
const findAndRemoveKeywords = require('./find-and-remove-keywords');

/**
 * @callback dateModifier
 * @param {string} original Original EDTF date
 * @returns {string} Modified EDTF date
 */

/**
 * Parse an array of words to a valid EDTF date.
 * @param {string[]} words The words to be parsed.
 * @param {string[]} dateFormats The allowed date formats.
 * @param {Object} keywords The keywords used to determine if the date is
 * approximate, uncertain, etc.
 * @param {string[]} keywords.approximate
 * @param {string[]} keywords.uncertain
 * @param {string[]} keywords.openStart
 * @param {string[]} keywords.openEnd
 * @param {Object.<string, dateModifier>} keywords.custom
 * @return {string} The resulting EDTF date string.
 */
function parseWords(words, dateFormats, keywords) {
  // Find custom keywords and remove them from words array
  const customKeywordModifiers = [];
  if (keywords.custom) {
    Object.keys(keywords.custom).forEach((keyword) => {
      const wordsWithoutCustomKeywords
          = findAndRemoveKeywords(words, [keyword]);
      if (wordsWithoutCustomKeywords) {
        words = wordsWithoutCustomKeywords;
        customKeywordModifiers.push(keywords.custom[keyword]);
      }
    });
  }

  // Find keywords and remove them from words array
  let isApproximate = false;
  let isUncertain = false;
  let hasOpenStart = false;
  let hasOpenEnd = false;
  const wordsWithoutApproximateKeywords
      = findAndRemoveKeywords(words, keywords.approximate);
  if (wordsWithoutApproximateKeywords) {
    isApproximate = true;
    words = wordsWithoutApproximateKeywords;
  }
  const wordsWithoutUncertainKeywords
      = findAndRemoveKeywords(words, keywords.uncertain);
  if (wordsWithoutUncertainKeywords) {
    isUncertain = true;
    words = wordsWithoutUncertainKeywords;
  }
  const wordsWithoutOpenStartKeywords
      = findAndRemoveKeywords(words, keywords.openStart);
  if (wordsWithoutOpenStartKeywords) {
    hasOpenStart = true;
    words = wordsWithoutOpenStartKeywords;
  }
  const wordsWithoutOpenEndKeywords
      = findAndRemoveKeywords(words, keywords.openEnd);
  if (wordsWithoutOpenEndKeywords) {
    hasOpenEnd = true;
    words = wordsWithoutOpenEndKeywords;
  }

  // Try parsing the dates using Moment.js
  const dateText = words.join(' ');
  const {date, format} = getValidDateFromString(dateText, dateFormats);

  // Determine precision of the date
  let precision = datePrecision.YEAR;
  if (format.includes('D')) {
    precision = datePrecision.DAY;
  } else if (format.includes('M')) {
    precision = datePrecision.MONTH;
  }

  // Build EDTF string
  const edtfFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'];
  let edtfString = date.format(edtfFormats[precision]);

  // Modify EDTF string according to found keywords
  customKeywordModifiers.forEach((modifier) => {
    edtfString = modifier(edtfString);
  });
  if (isApproximate && isUncertain) {
    edtfString += '%';
  } else if (isApproximate) {
    edtfString += '~';
  } else if (isUncertain) {
    edtfString += '?';
  }
  if (hasOpenStart) {
    edtfString = `[..${edtfString}]`;
  } else if (hasOpenEnd) {
    edtfString = `[${edtfString}..]`;
  }

  return edtfString;
}

module.exports = parseWords;
