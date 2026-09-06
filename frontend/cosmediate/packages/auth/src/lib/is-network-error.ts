type ApiFailureLike = {
  success?: boolean;
  message?: string;
  error?: string;
};

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isFetchNetworkError(error: unknown): boolean {
  if (isBrowserOffline()) return true;

  if (error instanceof TypeError) return true;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("failed to fetch") ||
      message.includes("network error") ||
      message.includes("network request failed") ||
      message.includes("load failed") ||
      message.includes("timeout") ||
      message.includes("econnrefused")
    );
  }

  return false;
}

export function isApiNetworkFailure(
  response: ApiFailureLike | null | undefined,
): boolean {
  if (isBrowserOffline()) return true;
  if (!response || response.success !== false) return false;

  const message = (response.message ?? "").toLowerCase();
  const error = (response.error ?? "").toLowerCase();

  return (
    message.includes("network error") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    error.includes("network")
  );
}
