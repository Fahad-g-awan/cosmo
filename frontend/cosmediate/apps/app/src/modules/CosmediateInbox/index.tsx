"use client";

import React, { useEffect, useState } from "react";

import { Separator } from "@cosmediate/ui/components/separator";
import { cn } from "@cosmediate/ui/lib/utils";

import ConversationItem from "./components/conversationBox/ConversationItem";
import ConversationList from "./components/conversationBox/ConversationList";

import ChatTreatmentInfo from "./components/chatBox/ChatTreatmentInfo";
import ChatInput from "./components/chatBox/ChatInput";
import ChatItem from "./components/chatBox/ChatItem";
import ChatList from "./components/chatBox/ChatList";
import ChatBox from "./components/chatBox/ChatBox";

import SelectConversationUI from "./components/SelectConversationUI";
import NoConversationUI from "./components/NoConversationUI";

import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Conversation } from "./types";

const CosmediateInbox = ({
  conversations,
  setConversations,
  allConversations,
  activeTab,
}: {
  conversations: Conversation[];
  allConversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  activeTab: string;
}) => {
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const { isMobileView, isTabletView } = useWindowWidth();

  const handleConversationArchive = (
    conversationId: number,
    typeBeforeArchive: "direct" | "informational"
  ) => {
    if (conversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, type: "archived", typeBeforeArchive }
            : conv
        )
      );

      setActiveConversation(null);
    }
  };

  const handleConversationUnarchive = (
    conversationId: number,
    typeBeforeArchive: "direct" | "informational"
  ) => {
    if (conversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, type: typeBeforeArchive, typeBeforeArchive: null }
            : conv
        )
      );

      setActiveConversation(null);
    }
  };

  const handleAddChatMessage = (message: string, conversationId: number) => {
    const updatedConversations = [...allConversations];
    const indexToUpdate = updatedConversations.findIndex(
      (item) => item.id === conversationId
    );
    updatedConversations[indexToUpdate]?.messages?.push({
      id: Date.now().toString(),
      senderId: 1,
      message: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "direct",
    });
    setConversations(updatedConversations);
  };

  useEffect(() => {
    setActiveConversation(null);
  }, [activeTab]);

  const isDesktopView = !isMobileView && !isTabletView;

  return (
    <div className={cn("w-full h-[90dvh] flex items-start justify-center")}>
      <div
        className={cn(
          "w-full max-w-[1500px] h-full flex max-lg:flex-col items-start justify-start border border-stroke rounded-[16px] overflow-hidden"
        )}
      >
        {(isDesktopView ||
          (!activeConversation && (isMobileView || isTabletView))) && (
          <CosmediateInbox.ConversationList>
            {conversations.map((conversation) => (
              <>
                <CosmediateInbox.ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={() => setActiveConversation(conversation)}
                  isActive={conversation.id === activeConversation?.id}
                />
                <Separator className="w-full" />
              </>
            ))}
          </CosmediateInbox.ConversationList>
        )}

        {(isDesktopView ||
          (activeConversation && (isMobileView || isTabletView))) && (
          <CosmediateInbox.ChatBox>
            {activeConversation && (
              <>
                <CosmediateInbox.ChatList
                  scrollUp={activeConversation.messages.length}
                  chatType={activeConversation.type}
                  chatTypeBeforeArchive={activeConversation.typeBeforeArchive}
                  treatment={activeConversation?.treatment}
                  setActiveConversation={setActiveConversation}
                  setChatArchive={() =>
                    handleConversationArchive(
                      activeConversation.id as number,
                      activeConversation.type as "direct" | "informational"
                    )
                  }
                  setChatUnarchive={() =>
                    handleConversationUnarchive(
                      activeConversation.id as number,
                      activeConversation.typeBeforeArchive as
                        | "direct"
                        | "informational"
                    )
                  }
                >
                  {activeConversation.messages.map((chat) => {
                    const user = activeConversation.participants.find(
                      (item) => item.id === chat.senderId
                    );
                    const isSender = user?.id === 1;

                    return (
                      <CosmediateInbox.ChatItem
                        key={chat.id}
                        chat={chat}
                        user={user!}
                        isSender={isSender}
                      />
                    );
                  })}
                </CosmediateInbox.ChatList>

                {activeConversation.type !== "informational" &&
                  activeConversation.typeBeforeArchive !== "informational" && (
                    <CosmediateInbox.ChatInput
                      handleAddChatMessage={handleAddChatMessage}
                      conversationId={activeConversation.id as number}
                      activeChat={activeConversation}
                    />
                  )}
              </>
            )}

            {!activeConversation && conversations.length > 0 && (
              <CosmediateInbox.SelectConversationUI />
            )}
            {!activeConversation && conversations.length < 1 && (
              <CosmediateInbox.NoConversationUI activeTab={activeTab} />
            )}
          </CosmediateInbox.ChatBox>
        )}
      </div>
    </div>
  );
};

CosmediateInbox.ConversationList = ConversationList;
CosmediateInbox.ConversationItem = ConversationItem;
CosmediateInbox.ChatBox = ChatBox;
CosmediateInbox.ChatList = ChatList;
CosmediateInbox.ChatItem = ChatItem;
CosmediateInbox.ChatInput = ChatInput;
CosmediateInbox.SelectConversationUI = SelectConversationUI;
CosmediateInbox.NoConversationUI = NoConversationUI;
CosmediateInbox.ChatTreatmentInfo = ChatTreatmentInfo;

export default CosmediateInbox;
