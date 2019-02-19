export declare function textToEdtf(
  input: string,
  options?: {
    locale?: 'en',
    customKeywords?: {
      [keyword: string]: (original: string) => string
    }
  }
): string;
