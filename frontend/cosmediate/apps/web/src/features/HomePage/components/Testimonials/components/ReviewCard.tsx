import { DateTime } from "luxon";
import Image from "next/image";
import React from "react";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Review } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { truncateText } from "@web/lib/utils";

const ReviewCard = ({ review }: { review: Review }) => {
  const { isMobileView } = useWindowWidth();
  const offset = isMobileView ? 60 : 100;

  return (
    <div
      className={cn(
        "w-full h-[350px] rounded-2xl p-5 flex flex-col justify-between gap-6 max-sm:gap-4 bg-white/20"
      )}
    >
      <p
        className={cn(
          "text-[30px] text-700 leading-[57.4px] text-wrap",
          "max-lg:text-[32px] max-lg:pt-7 max-sm:leading-[44.8px]",
          "max-sm:text-[20px] max-sm:pt-3 max-sm:leading-[28.6px]"
        )}
      >
        {truncateText(review?.comment, offset)}
      </p>

      <div
        className={cn(
          "flex gap-4 items-center w-full justify-end max-sm:flex-col-reverse max-sm:items-end",
          "max-xl:bottom-[0px]",
          "max-sm:bottom-[-15px]"
        )}
      >
        <div className="w-full flex items-center justify-end">
          <div className="w-fit inline-flex flex-col items-start justify-start gap-2">
            <p
              className={cn(
                "text-800 leading-[27px] text-[20px] font-semibold",
                "max-sm:text-sm capitalize"
              )}
            >
              {review?.authorName}
            </p>
            <h6
              className={cn(
                "text-600 leading-[18px] text-[14px] font-normal",
                "max-sm:text-[11px] max-sm:leading-[16.8px]"
              )}
            >
              {DateTime.fromISO(review?.createdAt).toFormat("dd MMM yyyy")}
            </h6>
          </div>
        </div>

        <Image
          src={"/avatar.jpg"}
          alt={review?.authorName || "user image"}
          width={100}
          height={100}
          quality={100}
          className="rounded-full w-25 max-lg:w-20"
        />
      </div>
    </div>
  );
};

export default ReviewCard;
