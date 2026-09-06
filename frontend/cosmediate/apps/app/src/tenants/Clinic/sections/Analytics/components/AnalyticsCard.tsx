import { cn } from "@cosmediate/ui/lib/utils";
import {
  BarGraph,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@cosmediate/ui";
import React from "react";
import { BadgeInfo } from "lucide-react";

import { getHighlightRange } from "@cosmediate/reviews-core";
import type { ReviewChartRange } from "@cosmediate/reviews-core";

interface AnalyticsCardProps {
  title: string;
  data: {
    totalCount: number;
    todayCount?: number;
    chartData?: { data: number; count: number }[];
    highlightIndex?: number;
    chartRange?: ReviewChartRange;
    onChartRangeChange?: (range: ReviewChartRange) => void;
    isUpcomingFeature?: boolean;
    colSpan?: number;
  };
}

export const AnalyticsCard = ({ title, data }: AnalyticsCardProps) => {
  const selectedRange =
    data.chartData && data.highlightIndex !== undefined
      ? getHighlightRange(data.chartData, data.highlightIndex)
      : ([1, data.chartData?.length ?? 30] as [number, number]);

  return (
    <div
      className={cn(
        "relative w-full p-8 bg-ghost-white rounded-3xl flex flex-col items-center justify-between gap-2 overflow-hidden",
        data.chartData && data.chartData.length > 0
          ? "h-[150px] max-sm:h-[170px]"
          : "h-[120px]",
        data?.isUpcomingFeature && "opacity-70",
        data?.colSpan && `col-span-${data?.colSpan}`,
      )}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <div className="uppercase text-start font-railway text-[13px] font-semibold leading-4 text-500">
          {title}
        </div>

        {data.onChartRangeChange && (
          <div className="flex items-center gap-1 rounded-full bg-white/80 p-0.5">
            {(["week", "month"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => data.onChartRangeChange?.(range)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-semibold uppercase rounded-full",
                  data.chartRange === range
                    ? "bg-primary-accent text-white"
                    : "text-500 hover:text-700",
                )}
              >
                {range}
              </button>
            ))}
          </div>
        )}

        {data?.isUpcomingFeature && !data.onChartRangeChange && <div />}
      </div>

      <div className="w-full flex items-center justify-between gap-2 max-sm:flex-col">
        <div className="w-full flex items-start justify-start gap-2">
          <div className="text-[34px] font-bold leading-10 text-800">
            {data.totalCount}
          </div>
          {data?.todayCount !== undefined && data.todayCount > 0 && (
            <div className="text-[20px] font-bold leading-6 text-green-500">
              +{data?.todayCount}
            </div>
          )}
        </div>

        {data.chartData && data.chartData.length > 0 && (
          <div className="w-full">
            <BarGraph
              bins={data.chartData}
              selectedRange={selectedRange}
              barStyle="round"
              barGapClass="gap-[2px]"
              variant="time"
            />
          </div>
        )}
      </div>

      {data?.isUpcomingFeature && (
        <div className="absolute top-3 right-3">
          <Tooltip>
            <TooltipTrigger>
              <BadgeInfo className="size-5 text-600 hover:text-700 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              This feature is under development. Soon, you'll be able to view
              accurate analytics and insights
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
