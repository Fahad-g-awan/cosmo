"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@cosmediate/ui/lib/utils";

export const Logo = () => (
  <div
    className={cn(
      "w-fit justify-self-start",
      "max-lg:w-[150px] max-sm:w-[120px]"
    )}
  >
    <Link href="/home" className="inline-block">
      <Image
        src="/logos/logo.svg"
        width={150}
        height={23}
        quality={100}
        alt="Company Logo"
        priority
      />
    </Link>
  </div>
);
