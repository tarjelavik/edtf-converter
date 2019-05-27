module.exports = {
  // Full dates
  '1999-07-30': 'juillet 30, 1999',
  // Month and year only dates
  '1999-07': 'juillet 1999',
  // Year only dates
  '1999': '1999',
  // Intervals
  '1999-07-30/2001-10-01': 'juillet 30, 1999 – octobre 1, 2001',
  '[..1999-07-30]': 'before juillet 30, 1999',
  '[2001-10-01?..]': 'after maybe octobre 1, 2001',
  // Merged intervals
  '2000-07/2000-09': 'juillet – septembre 2000',
  '2000-07-01/2000-09-01': 'juillet 1 – septembre 1, 2000',
  '2000-07-01/2000-07-10': 'juillet 1 – 10, 2000',
  // Modifiers
  '1999-07-30~/2001-10-01?': 'c. juillet 30, 1999 – maybe octobre 1, 2001',
  '%1999-07-30': 'maybe c. juillet 30, 1999',
  // Custom modifiers
  '[..1999-07-30..]': 'until at least juillet 30, 1999'
};
