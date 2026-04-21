export const formatEventDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) =>
  new Date(dateStr).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', ...options });

export const eventDateYear = (dateStr: string) => new Date(dateStr).getUTCFullYear();
