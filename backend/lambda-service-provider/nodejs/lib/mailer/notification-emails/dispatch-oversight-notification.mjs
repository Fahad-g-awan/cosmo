import { resolveOversightScope } from "./actor-routing.mjs";
import { sendAdminNotification } from "../send/index.mjs";

/**
 * Send a single admin-format oversight email with the correct recipient scope.
 *
 * @param {{
 *   config: Record<string, unknown>,
 *   adminType: string,
 *   adminData?: Record<string, unknown>,
 *   actor?: Record<string, unknown> | null,
 *   authContext?: Record<string, unknown> | null,
 *   isSelfUpdate?: boolean,
 *   identityUpdates?: Record<string, unknown>,
 * }} params
 */
export const dispatchOversightNotification = async ({
  config,
  adminType,
  adminData = {},
  actor,
  authContext,
  isSelfUpdate = false,
  identityUpdates = {},
}) => {
  const resolvedActor = actor ?? authContext;

  await sendAdminNotification({
    type: adminType,
    data: adminData,
    config,
    auditScope: resolveOversightScope({
      actor: resolvedActor,
      isSelfUpdate,
      identityUpdates,
    }),
  });
};
