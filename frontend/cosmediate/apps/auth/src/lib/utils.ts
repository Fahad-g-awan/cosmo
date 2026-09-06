export const parseError = (error: unknown) => {
  let errorMessage = "Unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
};
