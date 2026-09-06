import { PERMISSIONS } from "../../constants/auth/permissions/index.mjs";
import { ROUTE_ACCESS } from "./route-access.constants.mjs";
import { anyOf } from "./_policy.helpers.mjs";

export const IMAGE_ROUTE_DEFS = Object.freeze({
  UPLOAD: {
    key: "PUT:/image-upload",
    access: ROUTE_ACCESS.PERMISSIONED,
    policy: () => anyOf(PERMISSIONS.IMAGE.UPLOAD),
  },
});
