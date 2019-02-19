import escapeStringRegexp from 'escape-string-regexp';

/**
 * Checks if a list of words contains at least one of a list of keywords.
 * Removes found keywords from words array.
 * @private
 * @param {string[]} words The words to be examined
 * @param {string[]} keywords The keywords to find and remove
 * @return {string[]|null} Modified words array or null if no keywords were
 * found
 */
export default function findAndRemoveKeywords(words, keywords) {
  let wordsString = words.join(' ');
  let containsAtLeastOneKeyWord = false;
  keywords.forEach((keyword) => {
    const escaped = escapeStringRegexp(keyword);
    const regexString
        = String.raw`(^${escaped} | ${escaped}(?= )| ${escaped}$)`;
    const regex = new RegExp(regexString, 'gi');
    const containsKeyword = regex.test(wordsString);
    if (containsKeyword) {
      containsAtLeastOneKeyWord = true;
      wordsString = wordsString.replace(regex, '');
    }
  });
  words = wordsString.split(' ');
  return containsAtLeastOneKeyWord ? words : null;
}
