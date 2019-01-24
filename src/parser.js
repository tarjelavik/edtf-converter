'use strict';

const moment = require('moment');

/**
 * Get a Moment.js date from a string that is valid for at least one of the
 * given formats.
 * @param {string} dateString The string to be parsed.
 * @param {string[]} formats The formats to be validated against.
 * @return {moment.Moment} The resulting Moment.js date.
 */
function getValidDateFromString(dateString, formats) {
  let date;
  for (const format of formats) {
    console.log(`Validating ${dateString} against ${format}`);
    const momentDate = moment(dateString, format, true);
    if (momentDate.isValid()) {
      date = momentDate;
      break;
    }
  }
  if (!date) {
    throw new Error(`Date input "${dateString}" matches none of the available formats.`);
  }
  return date;
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

  const localeApproximateKeywords = (
    localeData.keywords &&
    localeData.keywords.approximate &&
    localeData.keywords.approximate.length
  ) ? localeData.keywords.approximate : [];

  const localeUncertainKeywords = (
    localeData.keywords &&
    localeData.keywords.unceratin &&
    localeData.keywords.unceratin.length
  ) ? localeData.keywords.unceratin : [];

  const localeDelimiters = (
    localeData.keywords &&
    localeData.keywords.interval &&
    localeData.keywords.interval.delimiters &&
    localeData.keywords.interval.delimiters.length
  ) ? localeData.keywords.interval.delimiters : [];

  const localeOpenStartKeywords = (
    localeData.keywords &&
    localeData.keywords.interval &&
    localeData.keywords.interval.openStart &&
    localeData.keywords.interval.openStart.length
  ) ? localeData.keywords.interval.openStart : [];

  const localeOpenEndKeywords = (
    localeData.keywords &&
    localeData.keywords.interval &&
    localeData.keywords.interval.openEnd &&
    localeData.keywords.interval.openEnd.length
  ) ? localeData.keywords.interval.openEnd : [];

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

  let startDate = getValidDateFromString(startDateText, localeDateFormats);
  let endDate = endDateText
      ? getValidDateFromString(endDateText, localeDateFormats)
      : null;

  console.log(startDate.toDate(), endDate.toDate());

  return input;
};
