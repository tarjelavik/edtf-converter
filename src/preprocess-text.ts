export default function preprocessText(text: string): string {
  // Remove commas
  text = text.replace(/,/g, '');

  // Add month and year if missing (e.g. 1-2/12/2000)
  const partialOnlyDayMatch =
    text.match(/^(\D*?)(\d{1,2})(\D+?)(\d{1,2})\/(\d{1,2})\/(\d{4})(\D*?)$/);
  if (partialOnlyDayMatch) {
    const [all, before, startDay, middle, endDay, month, year, after] = partialOnlyDayMatch;
    text = `${before}${startDay}/${month}/${year}${middle}${endDay}/${month}/${year}${after}`;
  }

  // Add month and year if missing (e.g. 1-2 December 2000)
  const partialOnlyDayMatch2 =
    text.match(/^(\D*?)(\d{1,2})(\D+?)(\d{1,2})\s*([^-–\d]+)\s*(\d{4})(\D*?)$/);
  if (partialOnlyDayMatch2) {
    const [all, before, startDay, middle, endDay, month, year, after] = partialOnlyDayMatch2;
    text = `${before}${startDay} ${month}${year}${middle}${endDay} ${month}${year}${after}`;
  }

  // Add year if missing (e.g. 31/01-31/02/2000)
  const partialOnlyDayMonthMatch =
      text.match(/^(\D*?)(\d{1,2})\/(\d{1,2})(\D+?)(\d{1,2})\/(\d{1,2})\/(\d{4})(\D*?)$/);
  if (partialOnlyDayMonthMatch) {
    const [all, before, startDay, startMonth, middle, endDay, endMonth, year, after] =
        partialOnlyDayMonthMatch;
    text =
      `${before}${startDay}/${startMonth}/${year}${middle}${endDay}/${endMonth}/${year}${after}`;
  }

  // Add year if missing (e.g. September - October 1958)
  const partialOnlyMonthMatch = text.match(/^([^-–\d]+)\s*(?:-|–)\s*([^-–\d]+)(\d{4})$/);
  if (partialOnlyMonthMatch) {
    const [all, startMonth, endMonth, year] = partialOnlyMonthMatch;
    text =
      `${startMonth} ${year} - ${endMonth}${year}`;
  }

  // Complete year if partial (e.g. 1930-35)
  const partialYearMatch = text.match(/^(\D*?)(\d{4})(\D+?)(\d{2})(\D*?)$/);
  if (partialYearMatch) {
    const [all, before, startYear, middle, partialEndYear, after] = partialYearMatch;
    text = `${before}${startYear}${middle}${startYear.slice(0, 2)}${partialEndYear}${after}`;
  }

  // Add spaces around '-' delimiter if missing
  const spacesMissingMatch = text.match(/^([^-–]*\S)(?:-|–)(\S[^-–]*)$/);
  if (spacesMissingMatch) {
    const [all, start, end] = spacesMissingMatch;
    text = `${start} - ${end}`;
  }

  return text;
}