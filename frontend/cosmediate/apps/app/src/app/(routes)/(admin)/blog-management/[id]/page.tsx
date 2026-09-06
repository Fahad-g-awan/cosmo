import type { Metadata } from "next";

import BlogDetails from "@app/tenants/Admin/sections/BlogManagement/pages/blogs/BlogDetails";
import { validateRoleForAdminRoutes } from "@app/lib/routing/roleRouting.server";
import { buildDashboardBlogMetadataById } from "@cosmediate/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return buildDashboardBlogMetadataById(id);
}

const page = async () => {
  await validateRoleForAdminRoutes();
  return <BlogDetails />;
};

export default page;
