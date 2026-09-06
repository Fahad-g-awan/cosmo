"use client";

import type { Specialist } from "@cosmediate/type-utils";

import { EntityReviewsPanel } from "@web/modules/Reviews/EntityReviewsPanel";

const ReviewsComp = ({
  specialist,
  showMinimal,
}: {
  specialist: Specialist;
  showMinimal?: boolean;
}) => {
  return <EntityReviewsPanel entity={specialist} showMinimal={showMinimal} />;
};

export default ReviewsComp;
