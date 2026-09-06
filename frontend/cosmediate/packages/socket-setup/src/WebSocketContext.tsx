"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useReducer,
  useCallback,
} from "react";
import { useAuth } from "@cosmediate/auth";
import { Review, ReviewReply } from "@cosmediate/type-utils";

import {
  SOCKET_EVENTS,
  emitReviewReplySocketEvent,
  emitReviewSocketEvent,
  subscribeReviewEvents,
} from "./review-event-bus";

type Action = "ADD" | "UPDATE" | "DELETE";

interface NewReview {
  data: Review | null;
  action: Action | null;
}

interface NewReviewReply {
  data: ReviewReply | null;
  action: Action | null;
}

interface NewChatMessage {
  data: unknown | null;
  action: Action | null;
}

interface AppState {
  newReview: NewReview;
  newReviewReply: NewReviewReply;
  newChatMessage: NewChatMessage;
}

interface AppAction {
  type: string;
  payload?: NewReview | NewReviewReply | NewChatMessage | null;
}

interface WebSocketContextType {
  review: NewReview;
  reviewReply: NewReviewReply;
  chatMessage: NewChatMessage;
  handleResetReviewState: () => void;
  handleResetReviewReplyState: () => void;
  handleResetChatState: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

const initialState: AppState = {
  newReview: { data: null, action: null },
  newReviewReply: { data: null, action: null },
  newChatMessage: { data: null, action: null },
};

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_NEW_REVIEW":
      return { ...state, newReview: action.payload as NewReview };
    case "SET_NEW_REVIEW_REPLY":
      return { ...state, newReviewReply: action.payload as NewReviewReply };
    case "SET_NEW_CHAT_MESSAGE":
      return { ...state, newChatMessage: action.payload as NewChatMessage };
    default:
      return state;
  }
};

const mapSocketAction = (eventType: string): Action | null => {
  if (eventType.endsWith("_ADDED")) return "ADD";
  if (eventType.endsWith("_UPDATED")) return "UPDATE";
  if (eventType.endsWith("_DELETED")) return "DELETE";
  return null;
};

const buildSocketUrl = (userId: string | null) => {
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";
  if (!userId) return baseUrl;
  return `${baseUrl}/?userId=${userId}`;
};

export const SocketHandler = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { session, isSessionLoading } = useAuth();
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<string | null>(null);
  const shouldStayConnectedRef = useRef(false);

  const handleResetReviewState = useCallback(() => {
    dispatch({
      type: "SET_NEW_REVIEW",
      payload: { data: null, action: null },
    });
  }, []);

  const handleResetReviewReplyState = useCallback(() => {
    dispatch({
      type: "SET_NEW_REVIEW_REPLY",
      payload: { data: null, action: null },
    });
  }, []);

  const handleResetChatState = useCallback(() => {
    dispatch({
      type: "SET_NEW_CHAT_MESSAGE",
      payload: { data: null, action: null },
    });
  }, []);

  const handleIncomingEvent = useCallback(
    (eventType: string, data: Review | ReviewReply | unknown) => {
      const action = mapSocketAction(eventType);

      switch (eventType) {
        case SOCKET_EVENTS.REVIEW_ADDED:
        case SOCKET_EVENTS.REVIEW_UPDATED:
        case SOCKET_EVENTS.REVIEW_DELETED:
          if (action) {
            emitReviewSocketEvent(action, data as Review);
            dispatch({
              type: "SET_NEW_REVIEW",
              payload: { data: data as Review, action },
            });
          }
          break;

        case SOCKET_EVENTS.REVIEW_REPLY_ADDED:
        case SOCKET_EVENTS.REVIEW_REPLY_UPDATED:
        case SOCKET_EVENTS.REVIEW_REPLY_DELETED:
          if (action) {
            emitReviewReplySocketEvent(action, data as ReviewReply);
            dispatch({
              type: "SET_NEW_REVIEW_REPLY",
              payload: { data: data as ReviewReply, action },
            });
          }
          break;

        case SOCKET_EVENTS.NEW_CHAT:
          dispatch({
            type: "SET_NEW_CHAT_MESSAGE",
            payload: { data, action: "ADD" },
          });
          break;

        default:
          break;
      }
    },
    [],
  );

  useEffect(() => {
    if (isSessionLoading) {
      console.log("[WebSocket] Waiting for auth session to resolve");
      return;
    }

    const userId = session?.profileId ?? session?.identityId ?? null;
    userIdRef.current = userId;
    shouldStayConnectedRef.current = true;

    console.log("[WebSocket] Session resolved", {
      profileId: session?.profileId ?? null,
      identityId: session?.identityId ?? null,
      userId: userId ?? "(anonymous)",
    });

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    let retries = 0;
    const maxRetries = 5;

    const connect = () => {
      if (!shouldStayConnectedRef.current) return;

      const socketAPI = buildSocketUrl(userIdRef.current);
      if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
        console.error("[WebSocket] NEXT_PUBLIC_SOCKET_URL is not set — connection will fail");
      }
      console.log("[WebSocket] Connecting...", {
        url: socketAPI,
        userId: userIdRef.current ?? "(anonymous)",
        attempt: retries + 1,
        maxRetries,
      });

      const ws = new WebSocket(socketAPI);
      socketRef.current = ws;

      ws.onopen = () => {
        retries = 0;
        console.log("[WebSocket] Connected", {
          userId: userIdRef.current ?? "(anonymous)",
          readyState: ws.readyState,
        });
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          console.log("[WebSocket] Message received", {
            eventType: parsed.eventType,
            userId: userIdRef.current ?? "(anonymous)",
          });
          handleIncomingEvent(parsed.eventType, parsed.data);
        } catch (error) {
          console.warn("[WebSocket] Failed to parse message", {
            raw: event.data,
            error,
          });
        }
      };

      ws.onclose = (event) => {
        console.warn("[WebSocket] Disconnected", {
          userId: userIdRef.current ?? "(anonymous)",
          code: event.code,
          reason: event.reason || "(none)",
          wasClean: event.wasClean,
          retries,
          maxRetries,
        });
        socketRef.current = null;
        if (retries < maxRetries && shouldStayConnectedRef.current) {
          retries += 1;
          const delayMs = 1000 * retries;
          console.log(`[WebSocket] Reconnecting in ${delayMs}ms (attempt ${retries}/${maxRetries})`);
          reconnectTimeout.current = setTimeout(connect, delayMs);
        } else if (retries >= maxRetries) {
          console.error("[WebSocket] Max reconnect retries reached — giving up");
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Connection error", {
          userId: userIdRef.current ?? "(anonymous)",
          url: socketAPI,
          error,
        });
        ws.close();
      };
    };

    connect();

    return () => {
      shouldStayConnectedRef.current = false;
      console.log("[WebSocket] Cleaning up connection", {
        userId: userIdRef.current ?? "(anonymous)",
      });
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [isSessionLoading, session?.profileId, session?.identityId, handleIncomingEvent]);

  return {
    review: state.newReview,
    reviewReply: state.newReviewReply,
    chatMessage: state.newChatMessage,
    handleResetReviewState,
    handleResetReviewReplyState,
    handleResetChatState,
  };
};

const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const appState = SocketHandler();

  return (
    <WebSocketContext.Provider value={appState}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export {
  SOCKET_EVENTS,
  subscribeReviewEvents,
  subscribeReviewSocketEvents,
  subscribeReviewReplySocketEvents,
} from "./review-event-bus";

export default WebSocketProvider;
