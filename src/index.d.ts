declare function edtfParser(
  input: string,
  options?: {
    locale?: 'en',
    customKeywords?: {
      [keyword: string]: (original: string) => string
    }
  }
): string;

export = edtfParser;
