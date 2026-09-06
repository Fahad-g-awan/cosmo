import { PERMISSIONS_REGISTRY } from "./permissions.registry.mjs";

export const flattenRegistryGrants = (resourceKeys = Object.keys(PERMISSIONS_REGISTRY)) =>
  [
    ...new Set(
      resourceKeys.flatMap((resource) =>
        (PERMISSIONS_REGISTRY[resource] ?? []).map((action) => `${resource}:${action}`),
      ),
    ),
  ];

const toPermissionKey = (resource) => resource.toUpperCase();

export const buildPermissionGroupsFromRegistry = (resourceKeys) =>
  Object.fromEntries(
    resourceKeys
      .filter((key) => PERMISSIONS_REGISTRY[key])
      .map((key) => [
        toPermissionKey(key),
        Object.fromEntries(
          PERMISSIONS_REGISTRY[key].map((action) => [
            action.toUpperCase(),
            `${key}:${action}`,
          ]),
        ),
      ]),
  );
