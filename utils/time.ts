import dayjs from "dayjs";

export function toRelTime(dateString: string): string {
  const date = dayjs(dateString, { utc: true });

  return date.fromNow();
}
