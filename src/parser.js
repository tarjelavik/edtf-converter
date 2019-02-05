'use strict';

const moment = require('moment');
const get = require('lodash/get');

/**
 * Enum for date precision.
 * @readonly
 * @enum {number}
 */
const datePrecision = {
  YEAR: 0,
  MONTH: 1,
  DAY: 2,
};

/**
 * @typedef {Object} DateInfo
 * @property {moment.Moment} date Moment.js date
 * @property {string} format The associated date format
 */

/**
 * Get a Moment.js date from a string that is valid for at least one of the
 * given formats.
 * @param {string} dateString The string to be parsed.
 * @param {string[]} formats The formats to be validated against.
 * @return {DateInfo} The result containing the date date and detected format.
 */
function getValidDateFromString(dateString, formats) {
  let date;
  let format;
  for (format of formats) {
    const momentDate = moment(dateString, format, true);
    if (momentDate.isValid()) {
      date = momentDate;
      break;
    }
  }
  if (!date) {
    throw new Error(
        `Date input "${dateString}" matches none of the available formats.`
    );
  }
  return {
    date,
    format,
  };
}

module.exports = (input, options) => {
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

  // Try to find keywords
  let startIsApproximate = false;
  let endIsApproximate = false;
  let startIsUncertain = false;
  let endIsUncertain = false;
  let hasOpenStart = false;
  let hasOpenEnd = false;

  localeApproximateKeywords.forEach((keyword) => {
    if (startWords.includes(keyword)) {
      startIsApproximate = true;
    }
    if (endWords.includes(keyword)) {
      endIsApproximate = true;
    }
  });

  localeUncertainKeywords.forEach((keyword) => {
    if (startWords.includes(keyword)) {
      startIsUncertain = true;
    }
    if (endWords.includes(keyword)) {
      endIsUncertain = true;
    }
  });

  if (!endWords.length) {
    localeOpenStartKeywords.forEach((keyword) => {
      if (startWords.includes(keyword)) {
        hasOpenStart = true;
      }
    });
    localeOpenEndKeywords.forEach((keyword) => {
      if (startWords.includes(keyword)) {
        hasOpenEnd = true;
      }
    });
  }

  // Determine start and end dates
  const allLocaleKeywords = [
    ...localeApproximateKeywords,
    ...localeUncertainKeywords,
    ...localeDelimiters,
    ...localeOpenStartKeywords,
    ...localeOpenEndKeywords,
  ];

  const startDateText = startWords
      .filter((word) => !allLocaleKeywords.includes(word))
      .join(' ');
  const endDateText = endWords
      .filter((word) => !allLocaleKeywords.includes(word))
      .join(' ');

  // Try parsing the dates using Moment.js
  const startDateInfo = getValidDateFromString(
      startDateText,
      localeDateFormats
  );
  const endDateInfo = endDateText
      ? getValidDateFromString(endDateText, localeDateFormats)
      : {};
  const startDate = startDateInfo.date;
  const startFormat = startDateInfo.format;
  let startPrecision;
  const endDate = endDateInfo.date;
  const endFormat = endDateInfo.format;
  let endPrecision;

  if (startFormat.includes('D')) {
    startPrecision = datePrecision.DAY;
  } else if (startFormat.includes('M')) {
    startPrecision = datePrecision.MONTH;
  } else {
    startPrecision = datePrecision.YEAR;
  }
  if (endFormat) {
    if (endFormat.includes('D')) {
      endPrecision = datePrecision.DAY;
    } else if (endFormat.includes('M')) {
      endPrecision = datePrecision.MONTH;
    } else {
      endPrecision = datePrecision.YEAR;
    }
  }

  // Build EDTF string
  const edtfFormats = ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'];
  let edtfString = startDate.format(edtfFormats[startPrecision]);
  if (endDate) {
    edtfString += `/${endDate.format(edtfFormats[endPrecision])}`;
  }

  return edtfString;
};
