import React, { useEffect, useRef, useState } from "react";

import { Input } from "@cosmediate/ui/components/input";
import { Conversation } from "../../types";

import { IoMdSend } from "react-icons/io";

const ChatInput = ({
  handleAddChatMessage,
  conversationId,
  activeChat,
}: {
  handleAddChatMessage: (message: string, conversationId: number) => void;
  conversationId: number;
  activeChat: Conversation;
}) => {
  const [message, setMessage] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeChat]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      handleAddChatMessage(message, conversationId);
      setMessage("");
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full py-2 px-4 max-sm:px-4 flex items-center justify-between gap-2 border border-stroke focus-within:border-primary-accent rounded-[16px]"
    >
      <Input
        ref={inputRef}
        placeholder="Type your message"
        className="w-full h-full p-0 text-sm border-0 bg-none "
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-4 py-2 max-sm:px-3 flex items-center justify-center rounded-xl max-sm:rounded-lg bg-900 hover:bg-800 cursor-pointer transition-all duration-300 ease-in-out"
      >
        <IoMdSend
          className="size-5 max-sm:size-4 text-white"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ChatInput;
