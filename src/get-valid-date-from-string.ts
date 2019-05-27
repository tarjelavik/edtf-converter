import * as moment from 'moment';

interface IDateInfo {
  date: moment.Moment;
  format: string;
}

/**
 * Get a Moment.js date from a string that is valid for at least one of the
 * given formats.
 *
 * @param dateString The string to be parsed.
 * @param formats The formats to be validated against.
 * @param locales The locales to be validated against.
 * @returns The result containing the date date and detected format.
 */
export default function getValidDateFromString(
  dateString: string,
  formats: string[],
  locales: string[],
): IDateInfo {
  let date: moment.Moment | null = null;
  let format: string | null = null;
  const originalMomentLocale = moment.locale();
  searchLoop:
    for (const locale of locales) {
      moment.locale(locale);
      for (format of formats) {
        const momentDate = moment(dateString, format, true);
        if (momentDate.isValid()) {
          date = momentDate;
          break searchLoop;
        }
      }
    }
  moment.locale(originalMomentLocale);
  if (!date) {
    throw new Error(
      `Date input "${dateString}" matches none of the available formats.`,
    );
  }
  return {
    date,
    format: format as string,
  };
}
