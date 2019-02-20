import {get, merge} from 'lodash';
import parseWords from './parse-words';

const DEFAULT_OPTIONS: IOptions = {
  locales: ['en'],
};

/** Allow customizing the converters' behaviour. */
export interface IOptions {
  /** The locales specify which words trigger a certain EDTF feature and how to parse date formats.
   * The order of the locales determines their priority while parsing. *Currently, only 'en' is
   * supported.
   */
  locales?: string[];
  /**
   * Allows adding custom keywords with corresponding modifier functions. If a keyword is detected,
   * it's modifier is called with the original EDTF string expecting it to return a modified EDTF
   * string.
   */
  customKeywords?: {[keyword: string]: (edtf: string) => string};
}

export class Converter {
  private localeData: any;
  private _options: IOptions;

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

  /** @type {EdtfConverter.Options} */
  set options(value) {
    this._options = {...DEFAULT_OPTIONS, ...value};
  }
  // eslint-disable-next-line require-jsdoc
  get options() {
    return this._options;
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
}
