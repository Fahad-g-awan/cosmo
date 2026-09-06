"use client";

import React, { useEffect, useState } from "react";
import { useMemo } from "react";

import {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
} from "@cosmediate/ui";
import { InboxTabLoader } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { ComingSoonBadge } from "@app/components/comingSoonFeatures/ComingSoonBadge";
import { FeatureDetails } from "@app/components/comingSoonFeatures/FeatureDetails";
import type { Conversation } from "@app/modules/CosmediateInbox/types";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import CosmediateInbox from "@app/modules/CosmediateInbox";

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    createdAt: "2025-06-13T09:00:00Z",
    updatedAt: "2025-06-13T09:00:00Z",
    type: "direct",
    typeBeforeArchive: null,
    treatment: {
      name: "Botox",
      clinic: "Health Care",
      phone: "+52 5555 5555 55",
      date: "Fri 24 May 2025. 10:30",
    },
    participants: [
      {
        id: 1,
        name: "Henry Cavil",
        image: "/avatar.jpg",
        role: "patient",
      },
      {
        id: 2,
        name: "Dr. John",
        image: "/avatar.jpg",
        role: "specialist",
      },
    ],
    messages: [
      {
        id: 101,
        senderId: 1,
        message: "Hey doctor, I have a question about my prescription.",
        type: "direct",
        createdAt: "2025-06-13T09:05:00Z",
        updatedAt: "2025-06-13T09:05:00Z",
      },
      {
        id: 102,
        senderId: 2,
        message: "Sure, Henry. What’s the issue?",
        type: "direct",
        createdAt: "2025-06-13T09:06:00Z",
        updatedAt: "2025-06-13T09:06:00Z",
      },
      {
        id: 103,
        senderId: 1,
        message: "I have a headache and some stomach pain.",
        type: "direct",
        createdAt: "2025-06-13T09:07:00Z",
        updatedAt: "2025-06-13T09:07:00Z",
      },
      {
        id: 104,
        senderId: 2,
        message: "Sure, Henry. What’s the issue?",
        type: "direct",
        createdAt: "2025-06-13T09:06:00Z",
        updatedAt: "2025-06-13T09:06:00Z",
      },
      {
        id: 105,
        senderId: 1,
        message: "I have a headache and some stomach pain.",
        type: "direct",
        createdAt: "2025-06-13T09:07:00Z",
        updatedAt: "2025-06-13T09:07:00Z",
      },
      {
        id: 106,
        senderId: 2,
        message: "Sure, Henry. What’s the issue?",
        type: "direct",
        createdAt: "2025-06-13T09:06:00Z",
        updatedAt: "2025-06-13T09:06:00Z",
      },
      {
        id: 107,
        senderId: 1,
        message: "I have a headache and some stomach pain.",
        type: "direct",
        createdAt: "2025-06-13T09:07:00Z",
        updatedAt: "2025-06-13T09:07:00Z",
      },
      {
        id: 108,
        senderId: 2,
        message: "Sure, Henry. What’s the issue?",
        type: "direct",
        createdAt: "2025-06-13T09:06:00Z",
        updatedAt: "2025-06-13T09:06:00Z",
      },
      {
        id: 109,
        senderId: 1,
        message: "I have a headache and some stomach pain.",
        type: "direct",
        createdAt: "2025-06-13T09:07:00Z",
        updatedAt: "2025-06-13T09:07:00Z",
      },
    ],
    lastMessage: "I have a headache and some stomach pain.",
  },
  {
    id: 2,
    createdAt: "2025-06-10T14:00:00Z",
    updatedAt: "2025-06-10T14:00:00Z",
    type: "informational",
    typeBeforeArchive: null,
    participants: [
      {
        id: 1,
        name: "Henry Cavil",
        image: "/avatar.jpg",
        role: "patient",
      },
      {
        id: 0,
        name: "Cosmediate",
        image: "/logos/favicon.png",
        role: "patient",
      },
    ],
    messages: [
      {
        id: 201,
        senderId: 0, // system or admin
        message: "Your appointment is confirmed for June 15 at 3:00 PM.",
        type: "informational",
        createdAt: "2025-06-10T14:00:00Z",
        updatedAt: "2025-06-10T14:00:00Z",
      },
    ],
    lastMessage: "Your appointment is confirmed for June 15 at 3:00 PM.",
  },
  {
    id: 3,
    createdAt: "2024-12-01T11:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
    type: "archived",
    typeBeforeArchive: "direct",
    treatment: {
      name: "Laser Hair Removal",
      clinic: "North Clinic",
      phone: "+52 5555 632 789",
      date: "Fri 30 Aug 2025. 10:30",
    },
    participants: [
      {
        id: 1,
        name: "Henry Cavil",
        image: "/avatar.jpg",
        role: "patient",
      },
      {
        id: 3,
        name: "Dr. Alice",
        image: "/avatar.jpg",
        role: "specialist",
      },
    ],
    messages: [
      {
        id: 301,
        senderId: 3,
        message: "This is your follow-up from the last appointment.",
        type: "archived",
        createdAt: "2024-12-01T11:15:00Z",
        updatedAt: "2024-12-01T11:15:00Z",
      },
    ],
    lastMessage: "This is your follow-up from the last appointment.",
  },
];

const CONVERSATION_MENU_ITEM = [
  {
    id: "all",
    label: "All",
    value: "all",
  },
  {
    id: "direct",
    label: "Direct",
    value: "direct",
  },
  {
    id: "informational",
    label: "Informational",
    value: "informational",
  },
  {
    id: "archived",
    label: "Archived",
    value: "archived",
  },
];

export const INBOX_FEATURE_COMING_SOON_DETAILS = {
  title: "Messaging Preview & Insights",
  description:
    "View all your messages in one place, from direct conversations with your clinic to important informational updates like maintenance alerts or announcements from the Cosmediate team. This inbox is a simplified version designed for your feedback and currently shows sample data to help you explore how it works.",
  keypoints: [
    "All Messages include direct chats, informational updates, and archived conversations, all in one unified view.",
    "Direct Messages support one-on-one communication between your clinic and patients, allowing real-time engagement.",
    "Informational Messages include non-interactive updates such as maintenance alerts or general clinic announcements.",
    "Archived Messages help keep your inbox clean by letting you hide less relevant conversations without deleting them.",
  ],
};

const PatientInbox = () => {
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [processedData, setProcessedData] =
    useState<Conversation[]>(CONVERSATIONS);

  const { setPanelHeaderConfig } = usePanelHeader();
  const { isMobileView } = useWindowWidth();

  const menuOrientation = useMemo(() => {
    if (isMobileView) return "vertical";
    return "horizontal";
  }, [isMobileView]);

  const getCount = (type: string) => {
    if (type === "all") return allConversations.length;
    return allConversations.filter((item) => item.type === type).length;
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(true);
      }, 1500);
    }).then(() => {
      setAllConversations(CONVERSATIONS);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (activeTab && allConversations.length > 0) {
      if (activeTab === "all") {
        setProcessedData(allConversations);
      } else {
        setProcessedData(
          allConversations.filter((item) => item.type === activeTab)
        );
      }
    }
  }, [activeTab, allConversations]);

  useEffect(() => {
    setPanelHeaderConfig(panelHeaderConfig.patient.inbox.main);
  }, [setPanelHeaderConfig]);

  const showLoader = allConversations.length < 1;

  if (showLoader) return <InboxTabLoader />;

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      <div
        className={cn(
          "w-full bg-ghost-blue flex flex-col items-start justify-center gap-4 max-lg:items-center p-10 max-sm:p-2 rounded-2xl mb-5"
        )}
      >
        <ComingSoonBadge />
        <FeatureDetails
          feature={INBOX_FEATURE_COMING_SOON_DETAILS}
          className="p-0 bg-transparent w-auto"
        />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-4 mb-5">
        <div className="w-full flex items-center justify-start">
          <SecondaryTabs
            value={activeTab}
            onValueChange={setActiveTab}
            orientation={menuOrientation}
          >
            <SecondaryTabsList>
              {CONVERSATION_MENU_ITEM.map((item) => (
                <SecondaryTabsTrigger
                  key={item.value}
                  value={item.value}
                  onClick={() => setActiveTab(item.value)}
                >
                  {item.label} ({getCount(item.value)})
                </SecondaryTabsTrigger>
              ))}
            </SecondaryTabsList>
          </SecondaryTabs>
        </div>

        <CosmediateInbox
          conversations={processedData}
          allConversations={allConversations}
          setConversations={setAllConversations}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default PatientInbox;
