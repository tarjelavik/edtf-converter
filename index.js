'use strict';
(() => {

  const peg = require('pegjs');
  const fs = require('fs');
  const pegText = fs.readFileSync('./parser.pegjs', 'utf-8');
  const parser = peg.generate(pegText);

  module.exports = (input) => {
    return parser.parse(input);
  }

})();
