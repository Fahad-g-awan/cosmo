import type { Treatment } from "@cosmediate/type-utils";

import type { SiteContext } from "../resolve-site";
import { truncate } from "../utils";
import { buildFaqPageJsonLd } from "./faq";
import { absoluteImage, buildBreadcrumbJsonLd } from "./shared";

export function buildTreatmentPageJsonLd(
  ctx: SiteContext,
  treatment: Treatment,
): Record<string, unknown>[] {
  const path = `/treatments/${treatment.id}`;
  const image = absoluteImage(ctx, treatment.image);

  const schemas: Record<string, unknown>[] = [
    buildBreadcrumbJsonLd(ctx, [
      { name: "Home", path: "/" },
      { name: "Treatments", path: "/treatments" },
      { name: treatment.name, path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      name: treatment.name,
      url: new URL(path, ctx.origin).toString(),
      ...(treatment.overview
        ? { description: truncate(treatment.overview) }
        : {}),
      ...(image ? { image } : {}),
      ...(treatment.categoryName
        ? { procedureType: treatment.categoryName }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: treatment.name,
      serviceType: treatment.categoryName ?? "Medical treatment",
      provider: {
        "@type": "Organization",
        name: "Cosmediate",
        url: ctx.origin,
      },
      url: new URL(path, ctx.origin).toString(),
      ...(treatment.overview
        ? { description: truncate(treatment.overview) }
        : {}),
      ...(image ? { image } : {}),
    },
  ];

  const faqSchema = buildFaqPageJsonLd(treatment.faqs);
  if (faqSchema) {
    schemas.push(faqSchema);
  }

  return schemas;
}
