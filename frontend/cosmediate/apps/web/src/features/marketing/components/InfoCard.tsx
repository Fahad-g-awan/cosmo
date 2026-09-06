import Image from "next/image";
import Link from "next/link";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

const InfoCard = ({
  className,
  image,
  title,
  description,
  href,
  linkLabel,
  variant,
}: {
  className?: string;
  image: string;
  title: string;
  description: string[];
  href?: string;
  linkLabel: string;
  variant?: "primary" | "secondary";
}) => {
  return (
    <div
      className={cn(
        "w-full h-full bg-ghost-blue flex flex-col items-start max-lg:items-center justify-center gap-4 rounded-2xl",
        "px-14 py-16 max-sm:px-4 max-sm:py-4",
        className
      )}
    >
      <Image
        src={image}
        alt="contact image"
        quality={100}
        height={80}
        width={80}
      />

      <h1 className="text-700 text-[32px] leading-[38px] font-bold max-lg:text-center">
        {title}
      </h1>

      <div
        className={cn(
          "w-full flex flex-col items-start justify-center gap-4",
          "text-start max-lg:text-center"
        )}
      >
        {description?.map((desc, index) => (
          <p key={index} className={cn(`text-sm leading-[21px] text-900`)}>
            {desc}
          </p>
        ))}
      </div>

      {href && (
        <Link
          href={href || "#"}
          className={cn(
            `px-6 py-3.5 bg-900 hover:bg-800 rounded-xl text-white flex items-center justify-center text-sm leading-[17px] font-bold `,
            variant === "primary" &&
              "bg-primary-accent hover:bg-primary-accent/90"
          )}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
};

export default InfoCard;
