/**
 * @module EdtfConverter
 */
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
    customKeywords?: {
        [keyword: string]: (edtf: string) => string;
    };
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
}
