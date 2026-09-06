import Image from "next/image";
import Link from "next/link";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { ArrowDownRight } from "lucide-react";

const FeatureCard = ({
  item,
  index,
}: {
  item: {
    id: string;
    image: string;
    url: string;
    name: string;
    description: string;
    urlLabel: string;
  };
  index: number;
}) => {
  return (
    <div className={cn("w-full lg:flex-1", index === 1 && "lg:-mt-20")}>
      <div className="w-full relative">
        <div className="w-full aspect-square relative">
          <Image
            src={item.image}
            fill
            priority
            quality={100}
            sizes="(max-width: 1024px) 100vw, 33vw"
            alt={item.name}
            className="rounded-2xl object-cover"
          />

          <Image
            src="/home/services/top-corner.svg"
            alt="top corner"
            height={16}
            width={16}
            className="absolute left-0 size-4 z-10"
            style={{ bottom: "19.3%" }}
          />

          <Image
            src="/home/services/top-corner.svg"
            alt="bottom corner"
            height={16}
            width={16}
            className="absolute bottom-0 size-4 z-10"
            style={{ left: "74%" }}
          />
        </div>

        <div className="w-[74%] -mt-[19.3%] relative z-10 bg-white rounded-tr-2xl rounded-bl-2xl px-6 py-5">
          <div className="flex flex-col gap-4">
            <div
              className={cn(
                "flex gap-1",
                item.id === "treatments" ? "flex-col-reverse" : "flex-col"
              )}
            >
              <div
                className={cn(
                  "font-bold text-[30px]  text-primary-accent",
                  "max-sm:text-[24px] max-xl:text-[24px] max-lg-text-[42px]"
                )}
              >
                {item.name}
              </div>
              <div
                className={cn(
                  "font-bold  text-700",
                  "max-sm:text-[15px] max-sm:leading-[15px]",
                  "max-xl:text-[12px] text-[18px] max-lg:text-[18px]"
                )}
              >
                {item.description}
              </div>
            </div>

            <Link
              href={item.url}
              className={cn(
                "group w-fit flex items-center justify-start gap-2 font-bold text-[12px]  text-primary-accent/75 hover:text-primary-accent transition-all duration-200"
              )}
            >
              {item.urlLabel}
              <ArrowDownRight className="-rotate-90 size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
