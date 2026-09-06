import type { ZodError } from "zod";
import type { FormErrors } from "./types";

/**
 * Convert a ZodError to a flat path-based error map
 * 
 * @example
 * zodToErrorMap(error) → {
 *   "firstName": "First name is required",
 *   "faqs.2.question": "Question is required"
 * }
 */
export function zodToErrorMap(error: ZodError): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    // Convert path array to dot notation: ["faqs", 2, "question"] → "faqs.2.question"
    const path = issue.path.join(".");
    
    // Only keep the first error for each path
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

/**
 * Clear errors for paths that start with a prefix
 * Useful for clearing nested errors when a parent changes
 */
export function clearErrorsByPrefix(
  errors: FormErrors,
  prefix: string
): FormErrors {
  const result: FormErrors = {};
  
  for (const [path, message] of Object.entries(errors)) {
    if (!path.startsWith(prefix)) {
      result[path] = message;
    }
  }
  
  return result;
}
