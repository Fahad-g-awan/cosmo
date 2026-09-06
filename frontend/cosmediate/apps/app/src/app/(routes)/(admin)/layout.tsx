import { ManagementLayout } from "@app/layout/management";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagementLayout tenant="admin">{children}</ManagementLayout>;
}
