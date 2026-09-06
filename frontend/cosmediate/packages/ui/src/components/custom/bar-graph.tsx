import { cn } from "@cosmediate/ui/lib/utils";
import React from "react";

interface BarGraphProps {
  bins: { data: number; count: number; label?: string; tooltip?: string }[];
  selectedRange: [number, number];
  barColor?: string;
  barColorInactive?: string;
  variant?: "price" | "time";
  barStyle?: "round" | "box";
  barGapClass?: string;
}

const MAX_BAR_HEIGHT = 56;

export const BarGraph: React.FC<BarGraphProps> = ({
  bins,
  selectedRange,
  variant = "price",
  barColor = "#6366f1",
  barColorInactive = "#c7d2fe",
  barStyle = "round",
  barGapClass,
}) => {
  const maxCount = Math.max(...bins.map((b) => b.count || 0), 1);
  const MIN_BAR_HEIGHT = 4;

  return (
    <div
      className={cn(
        // "flex items-end h-16 w-full px-2 select-none",
        "flex items-end h-16 w-full select-none",
        !barGapClass && (variant === "time" ? "gap-0" : "gap-[1px]"),
        barGapClass && barGapClass
      )}
    >
      {bins.length === 0 ? (
        <div className="w-full text-center text-xs text-gray-400">
          No price data available
        </div>
      ) : (
        bins.map((bin, i) => {
          // Always show a bar (even for zero count)
          const normalizedHeight =
            bin.count > 0
              ? MIN_BAR_HEIGHT +
                (bin.count / maxCount) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT)
              : 2;

          const isActive =
            bin.data >= selectedRange[0] && bin.data <= selectedRange[1];

          const title =
            bin.tooltip ??
            (bin.label != null
              ? `${bin.label} (${bin.count})`
              : variant === "price"
                ? `€${Math.round(bin.data)} (${bin.count})`
                : `${Math.round(bin.data)} (${bin.count})`);

          return (
            <div
              key={i}
              className="flex-1 flex justify-center"
              style={{ minWidth: 2 }}
              title={title}
            >
              <div
                className={cn("transition-colors duration-200", {
                  "rounded-2xl": barStyle === "round",
                  "rounded-none": barStyle === "box",
                })}
                style={{
                  height: `${normalizedHeight}px`,
                  width: "80%",
                  background: isActive ? barColor : barColorInactive,
                  opacity: bin.count > 0 ? (isActive ? 1 : 0.5) : 0.2,
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
};
