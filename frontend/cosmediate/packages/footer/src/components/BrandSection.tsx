"use client";

import Image from "next/image";

import SocialMediaLinks from "./SocialMediaLinks";
import { cn } from "@cosmediate/ui/lib/utils";

const BrandSection = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start max-sm:items-center gap-4",
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "w-[174px] max-lg:w-full max-sm:w-[150px] flex items-start justify-start max-sm:items-center"
        )}
      >
        <Image
          src="/logos/logo-white.svg"
          alt="white logo"
          width={200}
          height={200}
          className="object-cover w-full"
        />
      </div>

      <div
        className={cn(
          "w-full flex flex-col items-start justify-start gap-4 text-100 max-sm:items-center"
        )}
      >
        <p
          className={cn(
            "font-medium leading-[16.8px] text-[12px]",
            "max-sm:text-center"
          )}
        >
          The online platform that makes cosmetic <br /> treatments transparent,
          safe, and accessible
        </p>

        <p className={cn("text-[11px] leading-[17px] font-medium")}>
          © 2024 All rights reserved
        </p>
      </div>

      {/* Bottom warning image */}
      <div
        className={cn(
          "w-full xl:w-[247px] flex items-start justify-start max-sm:items-center"
        )}
      >
        <Image
          className={cn("rounded-lg object-cover w-full")}
          src="/footer/footer-logo.svg"
          alt="footer eye image"
          width={400}
          height={400}
        />
      </div>

      <SocialMediaLinks className="sm:hidden" />
    </div>
  );
};

export default BrandSection;
