import React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

const BlogHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center bg-gradient-to-tl from-[#F2F5FF] via-[#F6F8FF] to-[#F2F5FF]"
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "w-full py-6.5 flex flex-col justify-center items-center gap-6 ",
            "max-lg:gap-4 max-sm:gap-2"
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

BlogHeader.Title = Title;

export default BlogHeader;
