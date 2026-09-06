"use client";

import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { ChevronLeft, ChevronRight } from "lucide-react";

const ContentCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-between gap-6 bg-gray-card rounded-2xl px-8 py-6",
        "max-lg:gap-4 max-lg:px-6 max-lg:py-5"
      )}
    >
      {children}
    </div>
  );
};

const CardHeader = ({
  title,
  viewAllClick,
  handlePrevious,
  handleNext,
}: {
  title: string;
  viewAllClick?: () => void;
  handlePrevious?: () => void;
  handleNext?: () => void;
}) => {
  return (
    <div className="w-full flex justify-between items-start">
      <div
        className={cn(
          "font-bold text-700 text-xl leading-6",
          "max-lg:text-lg leading-5"
        )}
      >
        {title}
      </div>

      {viewAllClick && (
        <div
          className="flex gap-2 justify-start items-center cursor-pointer text-500 hover:text-700"
          onClick={viewAllClick}
        >
          <span
            className={cn(
              "font-medium text-sm leading-5",
              "max-lg:text-xs max-lg:leading-4"
            )}
          >
            View all
          </span>
          <ChevronRight className="w-4 h-4" />
        </div>
      )}

      {handlePrevious && handleNext && (
        <div className="flex gap-5 justify-start items-center">
          <div
            onClick={handlePrevious}
            className="h-6 w-6  text-500 hover:text-700 cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6" />
          </div>
          <div
            onClick={handleNext}
            className="h-6 w-6 text-500 hover:text-700 cursor-pointer"
          >
            <ChevronRight className="h-6 w-6" />
          </div>
        </div>
      )}
    </div>
  );
};

ContentCard.Header = CardHeader;

export default ContentCard;
