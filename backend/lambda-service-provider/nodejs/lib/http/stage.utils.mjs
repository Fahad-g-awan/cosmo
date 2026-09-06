/**
 * Resolve the environment stage from the event.
 *
 * @param {object} event - The event object.
 * @returns {string} The environment stage.
 */
export const resolveEnvStage = (event) => {
  return (
    event?.stageVariables?.env ??
    event?.stageVariables?.stage ??
    event?.requestContext?.stage ??
    process.env.STAGE ??
    "dev"
  );
};

/**
 * Strip the environment stage from the path.
 *
 * @param {string} path - The path to strip the environment stage from.
 * @param {string} env - The environment.
 * @returns {string} The path with the environment stage stripped.
 */
export const stripEnvStage = (path, env) => {
  if (!env) return path;
  const prefix = `/${env}`;
  return path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
};
