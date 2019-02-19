const edtfConverter = require('../');
const inputs = require('./inputs');
const assert = require('assert');

describe('edtf-converter', () => {
  describe('#textToEdtf', () => {
    Object.entries(inputs).forEach(([input, expectation]) => {
      it(`should convert ${input} to ${inputs[input]}`, () => {
        const result = edtfConverter.textToEdtf(input, {
          customKeywords: {
            'until at least': (edtf) => `[..${edtf}..]`,
            'as of': (edtf) => `[..${edtf}..]`,
          },
        });
        assert.equal(result, expectation);
      });
    });
  });
});
