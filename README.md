# edtf-parser

Parses natural language to EDTF compliant date strings.

### Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Reference](#api-reference)
4. [Compatibility](#compatibility)
5. [License](#license)

## Installation

```
$ npm install edtf-parser
```

## Usage

```javascript
const edtfParser = require('edtf-parser');
edtfParser('1940 until about June 1942');
// -> '1940/1942-06~'
```

## API Reference

### edtfParser(input, [options])

#### options

|Property|Type|Default|Description|
|-|-|-|-|
|locale|`string`|'en'|The locale determines which words can be used for parsing and how to parse date formats. Currently, only 'en' is supported.|
|customKeywords|`{ [keyword: string]: (original) => string }`||Allows adding custom keywords with corresponding modifier functions. If a keyword is detected, it's modifier is called with the original EDTF string expecting it to return a modified EDTF string.|

## Compatibility

edtf-parser implements select features of EDTF levels 0 and 1 as specified by ISO 8601-2 with some modifications, making it compatible to [EDTF.js](https://github.com/inukshuk/edtf.js).

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
| 12/31/2000 to 01/08/2001     | `2000-12-31/2001-01-08` |

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
