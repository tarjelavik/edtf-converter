/**
 * @module EdtfConverter
 */
import * as moment from 'moment';
/** Allow customizing the converters' behaviour. */
export interface IOptions {
    /** Used when converting an EDTF with the approxmiate modifier `~` to a date.
     *
     * Example: With `approximateVariance.days = 5`, the resulting min and max dates for
     * "~1930-05-03" are "1930-04-28" and "1930-05-08" respectively.
     */
    approximateVariance?: {
        /** @default 3 */
        days?: number;
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
    customKeywords?: {
        [keyword: string]: (edtf: string) => string;
    };
    /** The locales specify which words trigger a certain EDTF feature and how to parse date formats.
     * The order of the locales determines their priority while parsing. *Currently, only 'en' is
     * supported.
     * @default ['en']
     */
    locales?: string[];
}
/** An object containing the minimum and maximum date for an EDTF value */
export interface IDate {
    min: moment.Moment | null;
    max: moment.Moment | null;
}
/** Class representing a converter. */
export declare class Converter {
    private localeData;
    private _options;
    /** Initialize the options for the converter. */
    constructor(options: IOptions);
    /** Get the current options or update them for all subsequent operations. */
    options: IOptions;
    /**
     * Converts natural language to an EDTF compliant date string.
     */
    textToEdtf(input: string): string;
    /**
     * Converts an EDTF date string to `min` and `max` Moment.js dates
     */
    edtfToDate(edtf: string): IDate;
    /** Converts a single EDTF date section to a Moment.js date */
    private singleEdtfToDate;
}
