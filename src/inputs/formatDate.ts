type DateFormat = 'datetime' | 'date' | 'time';
export type FormattedDate = Date & { format: DateFormat };

function formatDate(this: FormattedDate) {
  if (isNaN(this.getTime())) return null;

  if (this.format === 'datetime')
    return this.toISOString().slice(0, 10) + 'T' + this.toTimeString().slice(0, 8);

  if (this.format === 'date')
    return this.toISOString().slice(0, 10);

  if (this.format === 'time')
    return this.toTimeString().slice(0, 8);
}

export function makeDateFormatted(date: FormattedDate, format: DateFormat) {
  if (date instanceof Date && !date.format) {
    date.toJSON = formatDate;
    date.toString = formatDate;
    date.format = format;
  }
}
