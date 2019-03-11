import { get, isArray } from 'lodash';
import { IOptions } from './edtf-converter';
import findAndRemoveKeywords from './find-and-remove-keywords';
import getValidDateFromString from './get-valid-date-from-string';

enum DatePrecision {
  YEAR,
  MONTH,
  DAY,
}

/**
 * Parses an array of words to a valid EDTF date.
 *
 * @internal
 */
export default function parseWords(words: string[], options: IOptions, localeData: any): string {
  // Collect keywords
  const keywords = {
    approximate: get(localeData, 'keywords.approximate') || [],
    custom: options.customKeywords,
    openEnd: get(localeData, 'keywords.interval.openEnd') || [],
    openStart: get(localeData, 'keywords.interval.openStart') || [],
    uncertain: get(localeData, 'keywords.uncertain') || [],
  };

  // Find custom keywords and remove them from words array
  const customKeywordModifiers: Array<(edtf: string) => string> = [];
  if (keywords.custom) {
    Object.keys(keywords.custom).forEach((keyword) => {
      const wordsWithoutCustomKeywords
          = findAndRemoveKeywords(words, [keyword]);
      if (wordsWithoutCustomKeywords) {
        words = wordsWithoutCustomKeywords;
        customKeywordModifiers.push(keywords.custom![keyword]);
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
  const localeNames = isArray(localeData.locale) ? localeData.locale : [localeData.locale];
  const {date, format} =
      getValidDateFromString(dateText, localeData.dateFormats, localeNames);

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
