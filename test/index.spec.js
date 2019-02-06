const parser = require('../');
const inputs = require('./inputs');
const assert = require('assert');

describe('edtf-parser', () => {
  Object.entries(inputs).forEach(([input, expectation]) => {
    it(`should parse ${input} to ${inputs[input]}`, () => {
      const result = parser(input, {
        customKeywords: {
          'until at least': (edtf) => `[..${edtf}..]`,
          'as of': (edtf) => `[..${edtf}..]`,
        },
      });
      assert.equal(result, expectation);
    });
  });
});
