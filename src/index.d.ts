export declare function parse(
  input: string,
  options?: {
    locale?: 'en',
    customKeywords?: {
      [keyword: string]: (original: string) => string
    }
  }
): string;
