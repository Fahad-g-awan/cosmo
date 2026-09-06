"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import NextTopLoader from "nextjs-toploader";

import { useNetworkStatus } from "@cosmediate/browse-manager/hooks/useNetworkStatus";
import { Toaster } from "@cosmediate/ui";
import { toast } from "sonner";

interface AppState {
  isLoading: boolean;
}
interface AppAction {
  type: string;
  payload?: boolean | string | number | Record<string, unknown> | null;
}
interface AppContextType {
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const initialState: AppState = {
  isLoading: false,
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_IS_LOADING":
      return { ...state, isLoading: action.payload as boolean };

    default:
      return state;
  }
};

const AppComp = (): AppContextType => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const isOnline = useNetworkStatus();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      Toaster("Connection lost", "error", "Internet connection lost", {
        id: "offline-toast",
        duration: Infinity,
      });
      wasOffline.current = true;
    } else {
      if (wasOffline.current) {
        toast.dismiss("offline-toast");
        Toaster(
          "Connection restored",
          "success",
          "Internet connection restored",
          {
            id: "online-toast",
          },
        );

        wasOffline.current = false;
      }
    }
  }, [isOnline]);

  const setIsLoading = (isLoading: boolean) =>
    dispatch({ type: "SET_IS_LOADING", payload: isLoading });

  return {
    setIsLoading,
    isLoading: state.isLoading,
  };
};

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = AppComp();

  return (
    <AppContext.Provider value={contextValue}>
      <NextTopLoader color="#6968EC" />
      {children}
    </AppContext.Provider>
  );
};

export const useAppHook = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppHook must be used within an AppContextProvider");
  }

  return context;
};

export default AppContextProvider;
