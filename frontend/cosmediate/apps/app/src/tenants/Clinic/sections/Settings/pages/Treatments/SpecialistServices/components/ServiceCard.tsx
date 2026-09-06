import Image from "next/image";
import Link from "next/link";

import type { ClinicSpecialistTreatmentItem } from "@cosmediate/api";
import { cn } from "@cosmediate/ui/lib/utils";

interface ServiceCardProps {
  item: ClinicSpecialistTreatmentItem;
  href: string;
}

const truncateText = (value: string | undefined | null, max: number) => {
  if (!value) return "";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
};

const formatFromPrice = (value?: number) => {
  if (value == null || Number.isNaN(value) || value <= 0) return null;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

export function ServiceCard({ item, href }: ServiceCardProps) {
  const price =
    item.minPrice != null && item.minPrice > 0
      ? item.minPrice
      : item.avgPrice != null && item.avgPrice > 0
        ? item.avgPrice
        : null;
  const priceLabel = formatFromPrice(price ?? undefined);

  return (
    <div className="relative flex w-full flex-col items-start justify-start gap-4 rounded-lg">
      <div className="relative w-full rounded-lg h-[170px]">
        <div className="h-full w-full overflow-hidden rounded-lg">
          <Image
            src={item.treatmentImage || "/placeholder.jpg"}
            alt={item.treatmentName || "treatment"}
            width={500}
            height={500}
            className="h-full w-full rounded-lg object-cover"
          />
        </div>

        {item.categoryName ? (
          <div
            className={cn(
              "absolute top-2 right-3 rounded-[8px] bg-white px-3 py-1",
              "text-[11px] font-medium leading-[17px] text-700 capitalize",
            )}
          >
            {item.categoryName}
          </div>
        ) : null}

        {priceLabel ? (
          <div
            className={cn(
              "absolute -bottom-3 right-[18px] flex h-8 w-25 items-center justify-center",
              "rounded-lg px-3 py-2 text-[11px] font-bold leading-[17px] text-900",
              "hero-gradient",
            )}
          >
            From {priceLabel}
          </div>
        ) : null}
      </div>

      <div className="flex w-full flex-col items-start justify-start gap-2 pt-1">
        <h3
          className={cn(
            "mt-2 w-full text-[18px] font-bold leading-[22px] text-700 capitalize",
            "max-xl:text-base",
          )}
        >
          {truncateText(item.treatmentName, 30)}
        </h3>

        {item.treatmentOverview ? (
          <p className="h-10 w-full text-[11px] font-medium leading-[17px] text-600 line-clamp-2">
            {truncateText(item.treatmentOverview, 60)}
          </p>
        ) : (
          <p className="h-10 w-full" />
        )}

        {item.specialistExperience ? (
          <p className="text-[11px] font-medium text-400">
            Experience: {item.specialistExperience}
          </p>
        ) : null}

        <Link
          href={href}
          className={cn(
            "w-full mt-1 inline-flex items-center justify-center rounded-lg border-2 border-stroke px-3 py-2",
            "text-sm font-bold text-primary-accent",
            "hover:bg-primary-accent-lite hover:text-primary-accent-dark",
          )}
        >
          View
        </Link>
      </div>
    </div>
  );
}
