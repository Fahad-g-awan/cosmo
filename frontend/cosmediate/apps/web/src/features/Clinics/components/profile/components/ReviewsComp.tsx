"use client";

import type { Clinic } from "@cosmediate/type-utils";

import { EntityReviewsPanel } from "@web/modules/Reviews/EntityReviewsPanel";

const ReviewsComp = ({
  clinic,
  showMinimal,
}: {
  clinic: Clinic;
  showMinimal?: boolean;
}) => {
  return <EntityReviewsPanel entity={clinic} showMinimal={showMinimal} />;
};

export default ReviewsComp;
