import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";

import { Conversation, MessageType, Treatment } from "../../types";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import ChatTreatmentInfo from "./ChatTreatmentInfo";

import { IoChevronBack, IoChevronDown } from "react-icons/io5";

const ChatList = ({
  children,
  scrollUp,
  chatType,
  chatTypeBeforeArchive,
  setChatArchive,
  setChatUnarchive,
  treatment,
  setActiveConversation,
}: {
  children: React.ReactNode;
  scrollUp: number;
  chatType: MessageType;
  chatTypeBeforeArchive: "direct" | "informational" | null;
  treatment?: Treatment;
  setChatArchive: () => void;
  setChatUnarchive: () => void;
  setActiveConversation: React.Dispatch<
    React.SetStateAction<Conversation | null>
  >;
}) => {
  const [showTreatmentInfo, setShowTreatmentInfo] = useState(true);

  const { isMobileView } = useWindowWidth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const formatedChatType = useMemo(() => {
    if (chatType === "direct") {
      return "Direct Message";
    } else {
      return chatType;
    }
  }, [chatType]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: scrollAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [scrollUp]);

  useEffect(() => {
    if (isMobileView) {
      setShowTreatmentInfo(false);
    } else {
      setShowTreatmentInfo(true);
    }
  }, [isMobileView]);

  const heightClasses = [
    // Desktop heights
    chatType === "informational" || chatTypeBeforeArchive === "informational"
      ? "h-[75dvh]"
      : "h-[55dvh] max-[1440px]:h-[52dvh] max-[1350px]:h-[40dvh]",

    // Mobile heights (max-sm)
    chatType === "informational" || chatTypeBeforeArchive === "informational"
      ? "max-sm:h-[77dvh]"
      : showTreatmentInfo
        ? "max-sm:h-[30dvh]"
        : "max-sm:h-[60dvh]",
  ].join(" ");

  return (
    <div className="w-full flex flex-col items-start justify-start">
      {treatment && (
        <>
          <div
            onClick={() => setShowTreatmentInfo(!showTreatmentInfo)}
            className="w-full flex items-center justify-end gap-2 text-xs text-600 cursor-pointer mb-2 sm:hidden"
          >
            <span>Treatment Details</span>
            <IoChevronDown
              className={cn(
                "size-3 transition-all duration-300",
                showTreatmentInfo ? "rotate-180" : "rotate-0"
              )}
            />
          </div>
          <div
            className={cn(
              "w-full",
              showTreatmentInfo ? "flex" : "max-sm:hidden"
            )}
          >
            <ChatTreatmentInfo treatment={treatment} />
          </div>
        </>
      )}

      <div className="w-full flex items-center justify-between max-sm:mt-2">
        <div className="w-full flex items-center justify-start gap-3">
          <div
            onClick={() => setActiveConversation(null)}
            className="p-1 border border-stroker rounded-md lg:hidden"
          >
            <IoChevronBack className="size-4 text-primary-accent" />
          </div>
          <div className="capitalize text-700 text-[18px] max-sm:text-sm font-bold leading-[22px]">
            {formatedChatType}
          </div>
        </div>
        <Button
          type="button"
          variant={"ghost"}
          onClick={chatType === "archived" ? setChatUnarchive : setChatArchive}
          className="text-[12px] leading-[16.8px] font-normal text-primary-accent transition-all duration-300"
        >
          {chatType === "archived" ? "Unarchive" : "Archive"}
        </Button>
      </div>

      <div
        ref={scrollAreaRef}
        className={cn("w-full overflow-y-auto overflowY", heightClasses)}
      >
        <div
          className="w-full min-h-full pb-2 flex flex-col items-center justify-end gap-3"
          ref={scrollAreaRef}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
