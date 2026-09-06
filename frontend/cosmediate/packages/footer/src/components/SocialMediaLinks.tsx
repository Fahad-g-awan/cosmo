"use client";

import { cn } from "@cosmediate/ui/lib/utils";

import { AiFillInstagram } from "react-icons/ai";
import { IoLogoFacebook } from "react-icons/io5";

const SocialMediaLinks = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start max-sm:justify-center gap-1",
        className
      )}
    >
      <IoLogoFacebook className="cursor-pointer size-8 max-sm:size-10 text-[#8F95A9] mr-4" />
      <AiFillInstagram className="cursor-pointer size-8 max-sm:size-10 text-[#8F95A9]" />
    </div>
  );
};

export default SocialMediaLinks;
