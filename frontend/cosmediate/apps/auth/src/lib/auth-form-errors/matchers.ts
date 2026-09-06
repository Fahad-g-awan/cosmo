import type { AuthFormErrorContext } from "./types";

export const includesAny =
  (...needles: string[]) =>
  ({ normalizedMessage }: AuthFormErrorContext) =>
    needles.some((needle) => normalizedMessage.includes(needle.toLowerCase()));

export const hasError =
  (...codes: AuthFormErrorContext["error"][]) =>
  ({ error }: AuthFormErrorContext) =>
    Boolean(error && codes.includes(error));

export const hasBackendError =
  (...codes: string[]) =>
  ({ error }: AuthFormErrorContext) =>
    Boolean(error && codes.includes(String(error)));
