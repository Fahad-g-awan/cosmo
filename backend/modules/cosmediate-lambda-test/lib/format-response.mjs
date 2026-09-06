/**
 * Normalizes a controller return value into args for `respond()`.
 *
 * @param {object | null | undefined} response - Controller result (`{ statusCode?, data?, headers?, cookies? }` or raw payload).
 * @param {Record<string, string>} baseHeaders - CORS / base headers from the handler.
 * @returns {{ statusCode: number, payload: object, headers: Record<string, string>, cookies: unknown[] }}
 */
export const formatControllerResponse = (response, baseHeaders) => {
  const statusCode =
    typeof response?.statusCode === "number" ? response.statusCode : 200;
  const payload = response?.data ?? response ?? {};
  const headers = response?.headers
    ? { ...baseHeaders, ...response.headers }
    : baseHeaders;
  const cookies = response?.cookies ?? [];

  return { statusCode, payload, headers, cookies };
};
