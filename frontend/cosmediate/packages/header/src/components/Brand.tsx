"use client";

import Image from "next/image";
import Link from "next/link";

const Brand = ({
  className,
  logoClasses,
}: {
  className?: string;
  logoClasses?: string;
}) => {
  return (
    <div className={className}>
      <Link href={"/home"}>
        <Image
          src="/logos/logo.svg"
          width={500}
          height={500}
          alt="home-logo"
          className={logoClasses}
        />
      </Link>
    </div>
  );
};

export default Brand;
