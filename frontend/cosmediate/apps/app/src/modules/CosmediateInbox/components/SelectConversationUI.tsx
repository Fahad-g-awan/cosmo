import Image from "next/image";
import React from "react";

const SelectConversationUI = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-10">
      <Image
        height={500}
        width={500}
        src="/logos/logo.svg"
        alt="cosmediate_logo"
        className="w-[150px]"
      />

      <div className="w-full flex flex-col  items-center justify-center gap-3">
        <div className="text-700 text-[24px] font-bold leading-[28px]">
          Select a conversation
        </div>
        <div className="text-500 text-[14px] font-medium leading-[21px]">
          to see messages
        </div>
      </div>
    </div>
  );
};

export default SelectConversationUI;
