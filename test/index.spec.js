const EdtfConverter = require('../').Converter;
const inputs = require('./inputs');
const assert = require('assert');

describe('edtf-converter', () => {
  const converter = new EdtfConverter({
    customKeywords: {
      'until at least': (edtf) => `[..${edtf}..]`,
      'as of': (edtf) => `[..${edtf}..]`,
    },
  });

  describe('#textToEdtf', () => {
    Object.entries(inputs).forEach(([input, expectation]) => {
      it(`should convert ${input} to ${inputs[input]}`, () => {
        const result = converter.textToEdtf(input);
        assert.equal(result, expectation);
      });
    });
  });
});
