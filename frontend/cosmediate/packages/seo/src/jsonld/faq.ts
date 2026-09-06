import type { FAQs } from "@cosmediate/type-utils";

import { jsonContentToPlainText } from "./content";

export function buildFaqPageJsonLd(
  faqs: FAQs[] | undefined,
): Record<string, unknown> | undefined {
  if (!faqs?.length) {
    return undefined;
  }

  const mainEntity = faqs
    .map((faq) => {
      const answer = jsonContentToPlainText(faq.answer);
      if (!faq.question || !answer) {
        return null;
      }

      return {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    })
    .filter(Boolean);

  if (!mainEntity.length) {
    return undefined;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
