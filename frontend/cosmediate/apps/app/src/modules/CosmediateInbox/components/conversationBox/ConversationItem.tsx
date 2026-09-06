import Image from "next/image";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { handleTime } from "../../lib/utils";
import { Conversation } from "../../types";

const ConversationItem = ({
  conversation,
  onClick,
  isActive,
}: {
  conversation: Conversation;
  onClick: () => void;
  isActive: boolean;
}) => {
  const sender = conversation.participants.find((item) => item.id !== 1);

  return (
    <div
      className={cn(
        "w-full p-4 flex items-center justify-start gap-2",
        "cursor-pointer hover:bg-gray-100 border-l-2 border-transparent",
        "transition-all duration-300",
        isActive && "bg-white hover:bg-white/90 border-primary-accent"
      )}
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
        <Image
          width={200}
          height={200}
          src={sender?.image || ""}
          alt={sender?.name || ""}
          className="w-full rounded-full object-cover"
        />
      </div>

      <div className="w-full flex flex-col items-start justify-start">
        <div className="w-full flex items-center justify-between">
          <span className="text-700 text-sm font-medium leading-[21px]">
            {sender?.name}
          </span>
          <span className="text-500 text-[12px] font-medium leading-[16.8px]">
            {handleTime(conversation.createdAt)}
          </span>
        </div>
        <div className="w-[220px] max-xl:w-[180px] truncate text-sm text-500 text-[12px] leading-[16.8px]">
          {conversation.lastMessage}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
