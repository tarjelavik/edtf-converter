/**
 * @module EdtfConverter
 */

import { get, merge } from 'lodash';
import * as moment from 'moment';
import parseWords from './parse-words';

/** @internal */
interface IParseSingleEdtfToDateResult {
  hasOpenEnd: boolean;
  hasOpenStart: boolean;
  isApproximate: boolean;
  isUncertain: boolean;
  maxDate: moment.Moment;
  minDate: moment.Moment;
}

/** Allow customizing the converters' behaviour. */
export interface IOptions {
  /** Used when converting an EDTF with the approxmiate modifier `~` to a date.
   *
   * Example: With `approximateVariance.days = 5`, the resulting min and max dates for
   * "~1930-05-03" are "1930-04-28" and "1930-05-08" respectively.
   */
  approximateVariance?: {
    /** @default 3 */
    days?: number,
    /** @default 3 */
    months?: number;
    /** @default 3 */
    years?: number;
  };
  /**
   * Allows adding custom keywords with corresponding modifier functions. If a keyword is detected,
   * it's modifier is called with the original EDTF string expecting it to return a modified EDTF
   * string.
   */
  customKeywords?: {[keyword: string]: (edtf: string) => string};
  /** The locales specify which words trigger a certain EDTF feature and how to parse date formats.
   * The order of the locales determines their priority while parsing. *Currently, only 'en' is
   * supported.
   * @default ['en']
   */
  locales?: string[];
}

const DEFAULT_OPTIONS: IOptions = {
  approximateVariance: {
    days: 3,
    months: 3,
    years: 3,
  },
  locales: ['en'],
};

/** An object containing the minimum and maximum date for an EDTF value */
export interface IDate {
  min: moment.Moment | null;
  max: moment.Moment | null;
}

/** Class representing a converter. */
export class Converter {
  private localeData: any;
  private _options: IOptions;

  /** Get the current options or update them for all subsequent operations. */
  set options(value: IOptions) {
    this._options = {...DEFAULT_OPTIONS, ...value};
  }
  get options(): IOptions {
    return this._options;
  }

  /** Initialize the options for the converter. */
  constructor(options: IOptions) {
    this.options = options || {};
    const localeNames = this.options.locales || [];
    const locales = localeNames.map((locale) => {
      try {
        return require(`./i18n/${locale}.json`);
      } catch (error) {
        throw new Error(`Locale "${locale}" is not supported.`);
      }
    });
    this.localeData = merge({}, ...locales);
  }

  /**
   * Converts natural language to an EDTF compliant date string.
   */
  public textToEdtf(input: string): string {
    // Remove commas
    input = input.replace(/,/g, '');

    // Split input into array of words
    const words = input.split(/\s/);

    // Try to find delimiter and separate start and end of input
    const localeDelimiters =
        get(this.localeData, 'keywords.interval.delimiters') || [];
    const delimiters = ['-', '–', ...localeDelimiters];
    let delimiterIndex = words
        .slice(1, -1) // Don't look for delimiter in first or last word
        .findIndex((word) => delimiters.includes(word));
    delimiterIndex = delimiterIndex === -1 ? -1 : delimiterIndex + 1;
    let startWords: string[];
    let endWords: string[];
    if (delimiterIndex > -1) {
      startWords = words.slice(0, delimiterIndex);
      endWords = words.slice(delimiterIndex + 1);
    } else {
      startWords = words;
      endWords = [];
    }

    // Parse words to EDTF string
    let edtf = parseWords(startWords, this.options, this.localeData);
    if (endWords.length) {
      const endEdtf = parseWords(endWords, this.options, this.localeData);
      edtf += `/${endEdtf}`;
    }

    return edtf;
  }

  /**
   * Converts an EDTF date string to `min` and `max` Moment.js dates
   */
  public edtfToDate(edtf: string): IDate {
    const edtfArray = edtf.split('/');
    const first = edtfArray[0];
    const second = edtfArray[1];
    const firstParseResult = this.singleEdtfToDate(first);
    const secondParseResult = second ? this.singleEdtfToDate(second) : null;
    let min: moment.Moment | null = null;
    let max: moment.Moment | null = null;
    if (firstParseResult.hasOpenStart) {
      max = firstParseResult.maxDate;
    } else if (firstParseResult.hasOpenEnd) {
      min = firstParseResult.minDate;
    } else {
      min = firstParseResult.minDate;
      max = secondParseResult ? secondParseResult.maxDate : firstParseResult.maxDate;
    }
    return {min, max};
  }

  /** Checks whether a given EDTF string is valid
   *  @throws {Error} Error thrown if invalid
   *  @see {@link https://github.com/simon-mathewson/edtf-converter#compatibility | Compatibility}
   */
  public validateEdtf(edtf: string) {
    const modifier = String.raw`([?~%])`;
    const edtfSection = String.raw`(${modifier}?\s*[0-9]{4}(-[0-9]{2}){0,2}\s*${modifier}?)`;
    const openStart = String.raw`(\[(\s*\.\.)?)`;
    const openEnd = String.raw`((\.\.\s*)?])`;
    const edtfRegex =
        String.raw`^\s*${openStart}?\s*${edtfSection}\s*(\/\s*${edtfSection}|${openEnd}?)?\s*$`;
    if (!new RegExp(edtfRegex).test(edtf)) {
      throw new Error(
        `Invalid EDTF: "${edtf}" is not EDTF compliant or contains unsupported features.`,
      );
    }
  }

  /** Converts a single EDTF date section to a Moment.js date */
  private singleEdtfToDate(edtf: string): IParseSingleEdtfToDateResult {
    // Validate input
    this.validateEdtf(edtf);
    // Find modifiers
    const isApproximate = /[~%]/g.test(edtf);
    const isUncertain = /[\?%]/g.test(edtf);
    const hasOpenStart = /^\[\s*\.\./.test(edtf);
    const hasOpenEnd = /\.\.\s*]$/.test(edtf);
    // Remove modifiers and whitespace from string
    const edtfClean = edtf.replace(/[\[\.\[\]\?~%\s]/g, '');
    // Determine the format
    let format: string;
    let unit: 'year' | 'month' | 'day';
    let variance: number;
    if (edtfClean.length === 4) {
      format = 'YYYY';
      unit = 'year';
      variance = this.options!.approximateVariance!.years as number;
    } else if (edtfClean.length === 7) {
      format = 'YYYY-MM';
      unit = 'month';
      variance = this.options!.approximateVariance!.months as number;
    } else {
      format = 'YYYY-MM-DD';
      unit = 'day';
      variance = this.options!.approximateVariance!.days as number;
    }
    // Init date variables
    const minDate = moment(edtfClean, format);
    const maxDate = moment(edtfClean, format);
    // Apply variance if approximate
    if (isApproximate) {
      minDate.subtract(variance, unit);
      maxDate.add(variance, unit);
    }
    // Set dates to minimum and maximum possible value
    minDate.startOf(unit);
    maxDate.endOf(unit);
    return {
      hasOpenEnd,
      hasOpenStart,
      isApproximate,
      isUncertain,
      maxDate,
      minDate,
    };
  }
}
