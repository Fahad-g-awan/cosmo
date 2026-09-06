import React, { useMemo } from "react";

import { RiWechatFill } from "react-icons/ri";

const NoConversationUI = ({ activeTab }: { activeTab: string }) => {
  const formatedActiveTab = useMemo(() => {
    if (activeTab === "direct") {
      return "Direct Message";
    } else {
      return activeTab;
    }
  }, [activeTab]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-10">
      <RiWechatFill className="w-[100px] h-[100px] text-primary-accent" />

      <div className="w-full flex flex-col items-center justify-center gap-3">
        <div className="text-700 text-[24px] font-bold leading-[28px]">
          <span className="capitalize">{formatedActiveTab}</span> section is
          empty
        </div>
      </div>
    </div>
  );
};

export default NoConversationUI;
