import moment from 'moment';

/**
 * @typedef {Object} DateInfo
 * @private
 * @property {moment.Moment} date Moment.js date
 * @property {string} format The associated date format
 */

/**
 * Get a Moment.js date from a string that is valid for at least one of the
 * given formats.
 * @private
 * @param {string} dateString The string to be parsed.
 * @param {string[]} formats The formats to be validated against.
 * @return {DateInfo} The result containing the date date and detected format.
 */
export default function getValidDateFromString(dateString, formats) {
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
