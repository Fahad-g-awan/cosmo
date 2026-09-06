import { getApiFailureMessage, type ApiFailureLike } from "./api-errors";

export const parseError = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    return getApiFailureMessage(error as ApiFailureLike);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred";
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const truncateText = (text: string, offset: number) => {
  if (!text) return "";
  if (text.length <= offset) return text;

  return text.slice(0, offset) + "...";
};
