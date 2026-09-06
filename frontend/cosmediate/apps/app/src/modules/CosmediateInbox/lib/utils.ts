import { DateTime } from "luxon";

export const handleTime = (date: string) => {
  const now = DateTime.now();
  const inputDate = DateTime.fromISO(date);

  const isToday = now.hasSame(inputDate, "day");
  const isYesterday = now.minus({ days: 1 }).hasSame(inputDate, "day");
  const diffInDays = Math.floor(now.diff(inputDate, "days").days);

  if (isToday) {
    return inputDate.toFormat("HH:mm");
  } else if (isYesterday) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return inputDate.toFormat("cccc");
  } else if (diffInDays < 14) {
    return `${diffInDays}d`;
  } else {
    return inputDate.toFormat("d/M/yyyy");
  }
};
