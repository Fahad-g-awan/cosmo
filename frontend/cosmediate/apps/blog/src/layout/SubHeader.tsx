import Image from "next/image";
import React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

const SubHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center bg-gradient-to-tl from-[#F2F5FF] via-[#F6F8FF] to-[#F2F5FF]"
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "w-full container py-6.5 flex flex-col justify-center items-center gap-6 ",
            "max-lg:gap-4 max-sm:gap-2",
            className
          )}
        >
          {children}
        </div>
      </SiteContainer>
    </div>
  );
};

const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "container capitalize w-full text-[30px] text-900 leading-9 font-bold text-wrap ",
        "max-sm:text-[20px] max-sm:leading-[24px]"
      )}
    >
      {children}
    </div>
  );
};

const BlogImage = ({
  containerClassName,
  imageClassName,
  src,
  alt,
}: {
  containerClassName: string;
  imageClassName: string;
  src: string;
  alt: string;
}) => {
  return (
    <div
      className={cn(
        "w-33.75 flex items-center justify-start",
        containerClassName
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={200}
        height={200}
        className={cn("w-full h-full object-cover", imageClassName)}
      />
    </div>
  );
};

SubHeader.BlogImage = BlogImage;
SubHeader.Title = Title;

export default SubHeader;
