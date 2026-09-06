import { buildRobots, resolveSiteContext } from "@cosmediate/seo";
import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const ctx = await resolveSiteContext("blog");
  return buildRobots(ctx);
}
