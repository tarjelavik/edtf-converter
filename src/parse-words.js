/// <reference path="./index.js" />

import getValidDateFromString from './get-valid-date-from-string';
import findAndRemoveKeywords from './find-and-remove-keywords';
import get from 'lodash/get';

/**
 * Enum for date precision.
 * @enum {number}
 * @private
 * @readonly
 */
export const DatePrecision = {
  YEAR: 0,
  MONTH: 1,
  DAY: 2,
};

/**
 * Parse an array of words to a valid EDTF date.
 * @private
 * @param {string[]} words The words to be parsed.
 * @param {EdtfConverter.Options} options
 * @param {Object} localeData An object containing the merged locale data.
 * @return {string} The resulting EDTF date string.
 */
export default function parseWords(words, options, localeData) {
  // Collect keywords
  const keywords = {
    approximate: get(localeData, 'keywords.approximate') || [],
    uncertain: get(localeData, 'keywords.uncertain') || [],
    openStart: get(localeData, 'keywords.interval.openStart') || [],
    openEnd: get(localeData, 'keywords.interval.openEnd') || [],
    custom: options.customKeywords,
  };

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
  const {date, format} =
      getValidDateFromString(dateText, localeData.dateFormats);

  // Determine precision of the date
  let precision = DatePrecision.YEAR;
  if (format.includes('D')) {
    precision = DatePrecision.DAY;
  } else if (format.includes('M')) {
    precision = DatePrecision.MONTH;
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
