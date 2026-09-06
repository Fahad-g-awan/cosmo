export const HANDLER_TIMEOUT_MS = 4700;

export const FETCH_TIMEOUT_MS = Math.min(
  4500,
  Math.max(
    500,
    Number.parseInt(process.env.PRETOKEN_DB_TIMEOUT_MS || "", 10) || 2800,
  ),
);

export const FETCH_RETRIES = Math.min(
  5,
  Math.max(1, Number.parseInt(process.env.PRETOKEN_DB_RETRIES || "", 10) || 3),
);
