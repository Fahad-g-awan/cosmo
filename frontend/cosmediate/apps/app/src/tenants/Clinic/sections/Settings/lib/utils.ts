import { isValidSubTreatment } from "../defaults/treatment.defaults";

export { isValidSubTreatment };

export const formatDurationDisplay = (durationValue: string): string => {
  if (!durationValue || durationValue === "Select Duration")
    return "Select Duration";

  const match = durationValue.match(/^(\d{2}):(\d{2})(?:\s*hrs?)?$/);
  if (!match) return durationValue;

  const hours = parseInt(match[1] as string, 10);
  const minutes = parseInt(match[2] as string, 10);

  if (hours === 0 && minutes === 0) return "0m";

  let result = "";
  if (hours > 0) result += `${hours}h`;
  if (minutes > 0) result += `${result ? " " : ""}${minutes}m`;

  return result;
};
