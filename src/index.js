const get = require('lodash/get');
const parseWords = require('./parse-words');

/**
 * Parse natural language to an EDTF compliant date string.
 * @param {string} input The string to be parsed.
 * @param {Object} options Additional options for the parser.
 * @param {string} options.locale The code for the locale to be used for
 * parsing.
 * @return {string} The resulting EDTF string.
 */
function parse(input, options) {
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

  // Split input into array of words
  const words = input.split(/\s/);

  // Try to find delimiter and separate start and end of input
  const delimiters = ['-', '–', ...localeDelimiters];
  const delimiterIndex = words.findIndex((word) => delimiters.includes(word));
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
        }
    );
    edtf += `/${endEdtf}`;
  }

  return edtf;
};

module.exports = parse;
