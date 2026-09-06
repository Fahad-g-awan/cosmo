"use client";

import React from "react";

import { Clinic } from "@cosmediate/type-utils";

import TabsContainer from "@web/components/profile/TabsContainer";
import ReviewsComp from "../components/ReviewsComp";

const ReviewsTab = ({ clinic }: { clinic: Clinic }) => {
  return (
    <TabsContainer>
      <ReviewsComp clinic={clinic} />
    </TabsContainer>
  );
};

export default ReviewsTab;
