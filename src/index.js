import get from 'lodash/get';
import parseWords from './parse-words';

/**
 * @callback dateModifier
 * @param {string} original Original EDTF date
 * @returns {string} Modified EDTF date
 */

/**
 * Converts natural language to an EDTF compliant date string.
 * @param {string} input The string to be converted.
 * @param {Object} options Additional options for the parser.
 * @param {string} options.locale The code for the locale to be used for
 * parsing.
 * @param {Object.<string, dateModifier>} options.customKeywords Custom
 * keywords and their modifier functions
 * @return {string} The resulting EDTF string.
 */
export function textToEdtf(input, options) {
  // Initialize options
  options = options || {};
  const locale = options.locale || 'en';
  let localeData;
  try {
    localeData = require(`./i18n/${locale}.json`);
  } catch (error) {
    throw new Error(`Locale "${locale}" is not supported.`);
  }

  // Initialize locale variables
  const localeDateFormats = localeData.dateFormats;
  if (!localeDateFormats || !localeDateFormats.length) {
    throw new Error(
        `At least one date format has to be provided in locale "${locale}".`
    );
  }
  const localeApproximateKeywords =
      get(localeData, 'keywords.approximate') || [];
  const localeUncertainKeywords =
      get(localeData, 'keywords.uncertain') || [];
  const localeDelimiters =
      get(localeData, 'keywords.interval.delimiters') || [];
  const localeOpenStartKeywords =
      get(localeData, 'keywords.interval.openStart') || [];
  const localeOpenEndKeywords =
      get(localeData, 'keywords.interval.openEnd') || [];

  // // Remove commas
  input = input.replace(/,/g, '');

  // Split input into array of words
  const words = input.split(/\s/);

  // Try to find delimiter and separate start and end of input
  const delimiters = ['-', '–', ...localeDelimiters];
  let delimiterIndex = words
      .slice(1, -1) // Don't look for delimiter in first or last word
      .findIndex((word) => delimiters.includes(word));
  delimiterIndex = delimiterIndex === -1 ? -1 : delimiterIndex + 1;
  let startWords;
  let endWords;
  if (delimiterIndex > -1) {
    startWords = words.slice(0, delimiterIndex);
    endWords = words.slice(delimiterIndex + 1);
  } else {
    startWords = words;
    endWords = [];
  }

  // Parse words to EDTF string
  let edtf = parseWords(
      startWords,
      localeDateFormats,
      {
        approximate: localeApproximateKeywords,
        uncertain: localeUncertainKeywords,
        openStart: localeOpenStartKeywords,
        openEnd: localeOpenEndKeywords,
        custom: options.customKeywords,
      }
  );
  if (endWords.length) {
    const endEdtf = parseWords(
        endWords,
        localeDateFormats,
        {
          approximate: localeApproximateKeywords,
          uncertain: localeUncertainKeywords,
          openStart: localeOpenStartKeywords,
          openEnd: localeOpenEndKeywords,
          custom: options.customKeywords,
        }
    );
    edtf += `/${endEdtf}`;
  }

  return edtf;
};
