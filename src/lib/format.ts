export function formatDate(date: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options
  }).format(parsed);
}

export function isDifferentDay(first?: string, second?: string): boolean {
  if (!first || !second) {
    return false;
  }

  const firstDate = new Date(first);
  const secondDate = new Date(second);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return false;
  }

  return firstDate.toDateString() !== secondDate.toDateString();
}
