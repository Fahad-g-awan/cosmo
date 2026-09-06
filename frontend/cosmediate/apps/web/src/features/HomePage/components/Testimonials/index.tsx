import * as React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Review } from "@cosmediate/type-utils/review";

import RegisterCard from "./components/RegisterCard";
import Reviews from "./components/Reviews";

interface TestimonialsProps {
  reviews: Review[];
  isLoading: boolean;
}

const Testimonials = ({ reviews, isLoading }: TestimonialsProps) => {
  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full flex items-start items-between max-lg:flex-col gap-[32px] max-lg:gap-0"
        )}
      >
        <RegisterCard />
        <Reviews reviews={reviews} isLoading={isLoading} />
      </div>
    </SiteContainer>
  );
};

export default Testimonials;
