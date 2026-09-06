import { UserRole } from "@cosmediate/type-utils";
import {
  adminRoutes,
  managerRoutes,
  specialistRoutes,
  patientRoutes,
} from "../../config/routes/middleware.routes";

interface RoleRouteConfig {
  defaultRoute: string;
  routes: string[];
}

export const ROLE_ROUTES: Record<UserRole, RoleRouteConfig> = {
  ADMIN: {
    defaultRoute: "/clinic-management",
    routes: adminRoutes,
  },
  MANAGER: {
    defaultRoute: "/analytics",
    routes: managerRoutes,
  },
  SPECIALIST: {
    defaultRoute: "/analytics",
    routes: specialistRoutes,
  },
  PATIENT: {
    defaultRoute: "/appointments",
    routes: patientRoutes,
  },
};
