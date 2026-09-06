export const parseError = (error: unknown) => {
  let errorMessage = "Unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
};

export const truncateText = (text: string, offset: number) => {
  if (!text) return "";
  if (text.length <= offset) return text;

  return text.slice(0, offset) + "...";
};
