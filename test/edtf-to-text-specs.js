module.exports = {
  // Full dates
  '1999-07-30': 'July 30, 1999',
  // Month and year only dates
  '1999-07': 'July 1999',
  // Year only dates
  '1999': '1999',
  // Intervals
  '1999-07-30/2001-10-01': 'July 30, 1999 – October 1, 2001',
  '[..1999-07-30]': 'until July 30, 1999',
  '[2001-10-01?..]': 'October 1, 2001 or after?',
  // Merged intervals
  '2000-07/2000-09': 'July – September 2000',
  '2000-07-01/2000-09-01': 'July 1 – September 1, 2000',
  '2000-07-01/2000-07-10': 'July 1 – 10, 2000',
  // Centuries & decades
  '18XX': '19th century',
  '147X': '1470s',
  // Modifiers
  '1999-07-30~/2001-10-01?': 'c. July 30, 1999 – October 1, 2001?',
  '%1999-07-30': 'c. July 30, 1999?',
  // Custom modifiers
  '[..1999-07-30..]': 'as of July 30, 1999',
  '[..1999-07-30/2000..]': 'July 30, 1999 until at least 2000',
};
