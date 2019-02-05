const intersection = require('lodash/intersection');
const flatten = require('lodash/flatten');
const difference = require('lodash/difference');
const getValidDateFromString = require('./get-valid-date-from-string');
const datePrecision = require('./date-precision');

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
 * @return {string} The resulting EDTF date string.
 */
function parseWords(words, dateFormats, keywords) {
  // Try to find keywords
  const isApproximate = !!intersection(keywords.approximate, words).length;
  const isUncertain = !!intersection(keywords.uncertain, words).length;
  const hasOpenStart = !!intersection(keywords.openStart, words).length;
  const hasOpenEnd = !!intersection(keywords.openEnd, words).length;

  // Determine date text without keywords
  const allKeywords = flatten(Object.values(keywords));
  const dateText = difference(words, allKeywords).join(' ');

  // Try parsing the dates using Moment.js
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

  return edtfString;
}

module.exports = parseWords;
