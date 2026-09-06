import { CLIENT_SESSION_COOKIE } from "@cosmediate/config";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const getRole = async () => {
  const cookieStore = await cookies();
  const userRole = cookieStore.get(CLIENT_SESSION_COOKIE.USER_ROLE)?.value;

  if (!userRole) {
    redirect("/auth/signin");
  }

  return userRole.toLowerCase();
};

export const validateRoleForPatientRoutes = async () => {
  const role = await getRole();

  if (role === "admin") {
    redirect("/clinic-management");
  }
  const isclinic = role === "manager" || role === "specialist";
  if (isclinic) {
    redirect("/analytics");
  }
};

export const validateRoleForAdminRoutes = async () => {
  const role = await getRole();

  if (role === "patient") {
    redirect("/appointments");
  }
  const isclinic = role === "manager" || role === "specialist";
  if (isclinic) {
    redirect("/analytics");
  }
};

export const validateRoleForClinicRoutes = async () => {
  const role = await getRole();

  if (role === "patient") {
    redirect("/appointments");
  }
  if (role === "admin") {
    redirect("/clinic-management");
  }
};
