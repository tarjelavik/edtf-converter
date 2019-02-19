declare namespace EdtfConverter {
  type Locale = 'en';

  type Options = {
    locales?: Locale[],
    customKeywords?: {
      [keyword: string]: (original: string) => string
    }
  }

  class Converter {
    options?: EdtfConverter.Options;
    
    constructor(options?: EdtfConverter.Options);
  
    textToEdtf(input: string): string;
  }
}

export = EdtfConverter;
