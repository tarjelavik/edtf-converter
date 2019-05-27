const EdtfConverter = require('../').Converter;
const inputs = require('./inputs');
const assert = require('assert');

describe('edtf-converter', () => {
  const converter = new EdtfConverter({
    approximateVariance: {
      years: 5,
      months: 5,
      days: 5,
    },
    customModifiers: [
      {
        keyword: 'until at least',
        modifierRegex: /^\[\.\..*\.\.]$/,
        addModifierFn: (edtf) => `[..${edtf}..]`,
        removeModifierFn: (edtf) => edtf.substring(3, edtf.length - 3)
      },
      {
        keyword: 'as of',
        modifierRegex: /^\[\.\..*\.\.]$/,
        addModifierFn: (edtf) => `[..${edtf}..]`,
        removeModifierFn: (edtf) => edtf.substring(3, edtf.length - 3)
      }
    ],
    locales: ['en', 'fr'],
    edtfToTextOptions: {
      dateFormat: 'MMMM D, YYYY',
      mergedIntervalDateFormats: {
        sameYear: ['MMMM D', 'MMMM D, YYYY'],
        sameYearAndMonth: ['MMMM D', 'D, YYYY'],
        sameYearOnlyMonth: ['MMMM', 'MMMM YYYY']
      },
      separator: '–',
    }
  });

  describe('#textToEdtf', () => {
    Object.entries(inputs).forEach(([input, expectation]) => {
      it(`should convert ${input} to ${inputs[input]}`, () => {
        const result = converter.textToEdtf(input);
        assert.strictEqual(result, expectation);
      });
    });
  });

  describe('#edtfToText should convert', () => {
    it('full dates', () => {
      assert.strictEqual(
        converter.edtfToText('1999-07-30'),
        'juillet 30, 1999'
      );
    });
    it('month and year only dates', () => {
      assert.strictEqual(
        converter.edtfToText('1999-07'),
        'juillet 1999'
      );
    });
    it('year only dates', () => {
      assert.strictEqual(
        converter.edtfToText('1999'),
        '1999'
      );
    });
    describe('intervals', () => {
      it('regular', () => {
        assert.strictEqual(
          converter.edtfToText('1999-07-30/2001-10-01'),
          'juillet 30, 1999 – octobre 1, 2001'
        );
        assert.strictEqual(
          converter.edtfToText('[..1999-07-30]'),
          'before juillet 30, 1999'
        );
        assert.strictEqual(
          converter.edtfToText('[2001-10-01?..]'),
          'after maybe octobre 1, 2001'
        );
      });
      it('merged', () => {
        assert.strictEqual(
          converter.edtfToText('2000-07/2000-09'),
          'juillet – septembre 2000'
        );
        assert.strictEqual(
          converter.edtfToText('2000-07-01/2000-09-01'),
          'juillet 1 – septembre 1, 2000'
        );
        assert.strictEqual(
          converter.edtfToText('2000-07-01/2000-07-10'),
          'juillet 1 – 10, 2000'
        );
      });
    });
    it('regular modifiers', () => {
      assert.strictEqual(
        converter.edtfToText('1999-07-30~/2001-10-01?'),
        'c. juillet 30, 1999 – maybe octobre 1, 2001'
      );
      assert.strictEqual(
        converter.edtfToText('%1999-07-30'),
        'maybe c. juillet 30, 1999'
      );
    });
    it('custom modifiers', () => {
      assert.strictEqual(
        converter.edtfToText('[..1999-07-30..]'),
        'until at least juillet 30, 1999'
      );
    });
  });
  
  describe('#edtfToDate should convert', () => {
    it('years', () => {
      const {min, max} = converter.edtfToDate('1985');
      assert.strictEqual(min.toISOString(), '1985-01-01T00:00:00.000Z');
      assert.strictEqual(max.toISOString(), '1985-12-31T23:59:59.999Z');
    });

    it('months', () => {
      const {min, max} = converter.edtfToDate('2010-05');
      assert.strictEqual(min.toISOString(), '2010-05-01T00:00:00.000Z');
      assert.strictEqual(max.toISOString(), '2010-05-31T23:59:59.999Z');
    });

    it('days', () => {
      const {min, max} = converter.edtfToDate('1395-11-28');
      assert.strictEqual(min.toISOString(), '1395-11-28T00:00:00.000Z');
      assert.strictEqual(max.toISOString(), '1395-11-28T23:59:59.999Z');
    });

    describe('approximate', () => {
      it('years', () => {
        const {min, max} = converter.edtfToDate('1985~');
        assert.strictEqual(min.toISOString(), '1980-01-01T00:00:00.000Z');
        assert.strictEqual(max.toISOString(), '1990-12-31T23:59:59.999Z');
      });
  
      it('months', () => {
        const {min, max} = converter.edtfToDate('%2010-05');
        assert.strictEqual(min.toISOString(), '2009-12-01T00:00:00.000Z');
        assert.strictEqual(max.toISOString(), '2010-10-31T23:59:59.999Z');
      });
  
      it('days', () => {
        const {min, max} = converter.edtfToDate('1395-11-28%');
        assert.strictEqual(min.toISOString(), '1395-11-23T00:00:00.000Z');
        assert.strictEqual(max.toISOString(), '1395-12-03T23:59:59.999Z');
      });
    });

    describe('intervals', () => {
      it('open start', () => {
        const {min, max} = converter.edtfToDate('[..1749-03]');
        assert.strictEqual(min, null);
        assert.strictEqual(max.toISOString(), '1749-03-31T23:59:59.999Z');
      });

      it('open end', () => {
        const {min, max} = converter.edtfToDate('[~1990-12-31? .. ]');
        assert.strictEqual(min.toISOString(), '1990-12-26T00:00:00.000Z');
        assert.strictEqual(max, null);
      });

      it('normal', () => {
        const {min, max} = converter.edtfToDate('0409-02-28~/2010');
        assert.strictEqual(min.toISOString(), '0409-02-23T00:00:00.000Z');
        assert.strictEqual(max.toISOString(), '2010-12-31T23:59:59.999Z');
      })
    })
  });

  describe('#validateEdtf', () => {
    it('should throw an error if EDTF is invalid', () => {
      assert.throws(() => {
        converter.validateEdtf('1950-31-12');
      });
      assert.throws(() => {
        converter.validateEdtf('..1900');
      });
      assert.throws(() => {
        converter.validateEdtf('2014/01/02');
      });
    });

    it('should not throw an error if EDTF is valid', () => {
      assert.doesNotThrow(() => {
        converter.validateEdtf('1950-12-31');
      });
      assert.doesNotThrow(() => {
        converter.validateEdtf('[..1900]');
      });
      assert.doesNotThrow(() => {
        converter.validateEdtf('2014-01?');
      });
      assert.doesNotThrow(() => {
        converter.validateEdtf('0001-01-01~');
      });
      assert.doesNotThrow(() => {
        converter.validateEdtf('2019/9999');
      });
    });
  });
});
