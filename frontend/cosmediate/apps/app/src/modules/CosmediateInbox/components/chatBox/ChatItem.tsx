import Image from "next/image";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { Message, Participant } from "../../types";
import { handleTime } from "../../lib/utils";

const ChatItem = ({
  chat,
  user,
  isSender,
}: {
  chat: Message;
  user: Participant;
  isSender: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-fit p-4 flex items-start justify-start gap-4 rounded-[16px]",
        !isSender && "bg-[#F4F6FF] self-start",
        isSender && "bg-[#FFFBE9] self-end"
      )}
    >
      <div className="w-10 h-10 rounded-full">
        <Image
          height={200}
          width={200}
          src={user.image}
          alt={user.name}
          className="w-full rounded-full object-cover"
        />
      </div>

      <div className="w-full flex flex-col items-start justify-center gap-2">
        <div className="w-full flex items-center justify-between gap-2">
          <div className="text-700 text-sm font-bold leading-[17px]">
            {user.name}
          </div>
          <div className="text-500 text-[11px] font-medium leading-[17px]">
            {handleTime(chat.createdAt)}
          </div>
        </div>
        <div className="text-900 text-sm leading-[18px]">{chat.message}</div>
      </div>
    </div>
  );
};

export default ChatItem;
