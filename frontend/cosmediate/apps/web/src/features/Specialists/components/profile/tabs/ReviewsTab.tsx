"use client";

import React from "react";

import { Specialist } from "@cosmediate/type-utils";

import TabsContainer from "@web/components/profile/TabsContainer";
import ReviewsComp from "../components/ReviewsComp";

const ReviewsTab = ({ specialist }: { specialist: Specialist }) => {
  return (
    <TabsContainer>
      <ReviewsComp specialist={specialist} />
    </TabsContainer>
  );
};

export default ReviewsTab;
