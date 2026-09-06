// Decision L1 (AUTH_SYSTEM_MASTER_PLAN 15.1):
// verbose auth-flow logs are gated behind DEBUG_AUTH=true.
// Errors always log. Never log tokens, secrets, or full cookie values.
export const debugAuth = (...args: unknown[]): void => {
  if (process.env.DEBUG_AUTH === "true") {
    console.log(...args);
  }
};
