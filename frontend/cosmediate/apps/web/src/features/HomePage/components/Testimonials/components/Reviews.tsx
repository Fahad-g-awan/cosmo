import Autoplay from "embla-carousel-autoplay";
import React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  SmallLoader,
} from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { Review } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import ReviewCard from "./ReviewCard";

import { MessageSquareOff } from "lucide-react";

interface ReviewsCarosalProps {
  reviews: Review[];
  isLoading: boolean;
}

const ReviewsCarosal = ({ reviews, isLoading }: ReviewsCarosalProps) => {
  const testimonials = useTranslations("marketing").home.testimonials;
  const showReviews = reviews.length > 0 && !isLoading;
  const showLoader = reviews.length < 1 && isLoading;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-start gap-5",
        "w-[65%] max-lg:w-full h-[500px] px-10 hero-gradient rounded-2xl",
        "max-lg:px-6 max-sm:px-4 py-10"
      )}
    >
      <div className="w-full flex items-center justify-start px-8">
        <span className="gap-8 max-lg:gap-10">
          <svg
            width="54"
            height="33"
            viewBox="0 0 54 33"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5665 10.6956C20.2167 11.2174 24.2069 15.913 24.2069 21.7826C24.2069 28.0435 19.5517 33 12.3695 33C4.65517 33 0 27.2609 0 20.7391V19.6956C0 11.6087 5.58621 4.04347 13.6995 0L13.5665 10.6956ZM29.7931 20.7391V19.6956C29.7931 11.6087 35.3793 4.04347 43.4926 0L43.3596 10.6956C50.0098 11.2174 54 15.913 54 21.7826C54 28.0435 49.3448 33 42.1626 33C34.4483 33 29.7931 27.2609 29.7931 20.7391Z"
              fill="#6968EC"
            ></path>
          </svg>
        </span>
      </div>

      {!showReviews && !showLoader && (
        <div className="w-full h-[300px] flex flex-col items-center justify-center gap-3 text-center">
          <MessageSquareOff className="text-primary-accent size-15 stroke-[1.5]" />
          <p className="text-lg text-600 font-medium">
            {testimonials.noReviewsTitle}
          </p>
          <p className="text-base text-600">{testimonials.noReviewsBody}</p>
        </div>
      )}

      {showLoader && (
        <div className="w-full h-[300px] flex flex-col items-center justify-center gap-3">
          <SmallLoader showText={false} />
        </div>
      )}

      {showReviews && (
        <Carousel
          plugins={[
            Autoplay({
              delay: 5000, // Increased delay to give user more time to read
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            loop: true,
            align: "start",
            duration: 5000, // Reduced animation duration
            dragFree: false,
          }}
          className="w-full max-w-225"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem
                key={`${review.id}-${index}`}
                className="pl-4 md:basis-1/1 lg:basis-1/1"
              >
                <div className="p-2">
                  <ReviewCard review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* <div className="justify-end gap-2 mt-4 hidden">
            <CarouselPrevious className="static" />
            <CarouselNext className="static" />
          </div> */}
        </Carousel>
      )}
    </div>
  );
};

export default ReviewsCarosal;
