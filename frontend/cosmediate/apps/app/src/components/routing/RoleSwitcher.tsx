export default function RoleSwitcher({
  role,
  patient,
  clinic,
  admin,
}: {
  role: string;
  patient?: React.ReactNode;
  clinic?: React.ReactNode;
  admin?: React.ReactNode;
}) {
  if (role === "manager" || role === "specialist") {
    return clinic;
  }
  if (role === "admin") {
    return admin;
  }
  return patient;
}
