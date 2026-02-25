/** Convert yyyy-mm-dd string to Date */
export function stringToDate(dateStr: string): Date {
  return new Date(dateStr);
}

/** Convert Date to yyyy-mm-dd string */
export function dateToString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Add days to a date */
export function addDays(date: Date, numberOfDays: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + numberOfDays
  );
}

/** Get max future date for monitor (7 days ahead) */
export function getMaxFutureDateForMonitor(): Date {
  return addDays(new Date(), 7);
}
