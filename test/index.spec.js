const parser = require('../src/parser');
const inputs = require('./inputs');
const assert = require('assert');

describe('edtf-parser', () => {
  Object.entries(inputs).forEach(([input, expectation]) => {
    it(`should parse ${input} to ${inputs[input]}`, () => {
      const result = parser(input);
      assert.equal(result, expectation);
    });
  });
});
