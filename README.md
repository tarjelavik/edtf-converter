# edtf-parser

Parses human language input to EDTF compliant date strings.

# Compatibility

edtf-parser implements select features of EDTF levels 0 and 1 as specified by ISO 8601-2 with some modifications, making it compatible to [EDTF.js](https://github.com/inukshuk/edtf.js).

## Level 0

### Date

| Input (example) | Output       |
|-----------------|--------------|
| 12/31/2000      | `2000-12-31` |
| August 4th 2000 | `2000-08-04` |
| December 2000   | `2000-12`    |
| 2000            | `2000`       |

### Date and Time

*Not supported*

### Time Interval

| Input (example)           | Output                  |
|---------------------------|-------------------------|
| from 1984 to 2001         | `1984/2001`             |
| February 2010 - June 2011 | `2010-02/2011-06`       |
| 12/31/2000 01/08/2001     | `2000-12-31/2001-01-08` |

## Level 1

### Letter-prefixed Calendar Year

*Not supported*

### Seasons

| Input (example) | Output    |
|-----------------|-----------|
| Spring 2001     | `2001-21` |

### Qualification of a Date (Uncertain/Approximate)

| Input (example)           | Output        |
|---------------------------|---------------|
| possibly 1984             | `1984?`       |
| around June 2004          | `2004-06~`    |
| possibly about 31/12/2004 | `2004-31-12%` |

### Unspecified Digits

*Only supporting decades*

| Input (example) | Output |
|-----------------|--------|
| 1960s           | `196X` |

### Extended Interval (L1)

*Only supporting open end and open start time intervals as well as approximate/uncertain modifiers*

| Input (example)                  | Output          |
|----------------------------------|-----------------|
| since 1970                       | `[1970..]`        |
| until 1970                       | `[..1970]`        |
| from 1950 until around June 1970 | `1950/1970-06~` |

### Negative Calendar Year

*Not supported*
