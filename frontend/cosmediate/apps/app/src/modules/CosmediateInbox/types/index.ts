export type MessageType = "direct" | "informational" | "archived";

export interface Conversation {
  id: string | number;
  participants: Participant[];
  messages: Message[];
  treatment?: Treatment;
  type: MessageType;
  typeBeforeArchive: "direct" | "informational" | null;
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
}

export interface Treatment {
  name: string;
  clinic: string;
  phone: string;
  date: string;
}

export interface Participant {
  id: string | number;
  name: string;
  image: string;
  role: "patient" | "specialist";
}

export interface Message {
  id: string | number;
  senderId: string | number;
  message: string;
  type: MessageType;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    read?: boolean;
    attachments?: string[];
  };
}
