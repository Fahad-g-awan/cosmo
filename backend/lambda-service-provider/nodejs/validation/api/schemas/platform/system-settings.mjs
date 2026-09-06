export const SystemSettingUpdate = {
  type: "object",
  additionalProperties: false,
  properties: {
    maintenanceMode: { type: "boolean" },
    maintenanceMessage: {
      type: ["string", "null"],
      maxLength: 2000,
    },
    maintenanceAllowAdminAccess: { type: "boolean" },
    featureFlags: {
      type: "object",
      additionalProperties: true,
    },
  },
  minProperties: 1,
};
