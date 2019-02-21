# EDTF Converter

Allows converting between natural language, EDTF compliant date strings and JS/Moment dates.

## Installation

```
$ npm install edtf-converter
```

## Usage

### Node.js (CommonJS)

```javascript
const { Converter } = require('edtf-converter');
const converter = new Converter();
converter.textToEdtf('1940 until about June 1942');
// -> '1940/1942-06~'
```

### Browser

#### ES6

```javascript
import * as EdtfConverter from 'edtf-converter';
const converter = new EdtfConverter.Converter();
converter.textToEdtf('1940 until about June 1942');
// -> '1940/1942-06~'
```

#### \<script>
Download [edtf-converter.min.js](https://raw.githubusercontent.com/simon-mathewson/edtf-converter/master/dist/edtf-converter.min.js) separately without the rest of the package.
```html
<script src="edtf-converter.min.js"></script>
<script>
  const converter = new edtfConverter.Converter();
  converter.textToEdtf('1940 until about June 1942');
  // -> '1940/1942-06~'
</script>
```

## API Reference

### [Open API eference](https://simon-mathewson.github.io/edtf-converter/modules/edtfconverter.html)

## Compatibility

edtf-converter implements select features of EDTF levels 0 and 1 as specified by ISO 8601-2 with some modifications, making it compatible to [EDTF.js](https://github.com/inukshuk/edtf.js).

### Level 0

#### Date

| Input (example) | Output       |
|-----------------|--------------|
| 12/31/2000      | `2000-12-31` |
| August 4th 2000 | `2000-08-04` |
| December 2000   | `2000-12`    |
| 2000            | `2000`       |

#### Date and Time

*Not supported*

#### Time Interval

| Input (example)           | Output                  |
|---------------------------|-------------------------|
| 1984 to 2001              | `1984/2001`             |
| February 2010 - June 2011 | `2010-02/2011-06`       |
| 12/31/2000 to 01/08/2001  | `2000-12-31/2001-01-08` |

### Level 1

#### Letter-prefixed Calendar Year

*Not supported*

#### Seasons

*Will be supported in the future*
<!-- 
| Input (example) | Output    |
|-----------------|-----------|
| Spring 2001     | `2001-21` | -->

#### Qualification of a Date (Uncertain/Approximate)

| Input (example)           | Output        |
|---------------------------|---------------|
| possibly 1984             | `1984?`       |
| around June 2004          | `2004-06~`    |
| possibly about 31/12/2004 | `2004-31-12%` |

#### Unspecified Digits

*Will be supported in the future*
<!-- *Only supporting decades*

| Input (example) | Output |
|-----------------|--------|
| 1960s           | `196X` | -->

#### Extended Interval (L1)

*Only supporting open end and open start time intervals as well as approximate/uncertain modifiers*

| Input (example)                  | Output          |
|----------------------------------|-----------------|
| since 1970                       | `[1970..]`      |
| until 1970                       | `[..1970]`      |
| 1950 until around June 1970      | `1950/1970-06~` |

#### Negative Calendar Year

*Not supported*

## License

MIT © Simon Mathewson
