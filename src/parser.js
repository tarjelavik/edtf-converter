'use strict';

module.exports = (input, options) => {

  options = options || {};
  const locale = options.locale || 'en';
  let localeData;
  try {
    localeData = require(`./i18n/${locale}.json`)
  } catch (error) {
    throw new Error(`Locale "${locale}" is not supported.`)
  }
  
}
