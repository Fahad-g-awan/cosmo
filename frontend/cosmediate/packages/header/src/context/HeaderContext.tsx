"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface HeaderContextType {
  isTopSticky: boolean;
  isScrollSticky: boolean;
  handleMakeHeaderSticky: () => void;
  handleMakeHeaderNonSticky: () => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [isTopSticky, setIsTopSticky] = useState(false);
  const [isScrollSticky, setIsScrollSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // const viewportHeight = window.innerHeight;
      const THRESHOLD = 150;

      if (scrollPosition > THRESHOLD) {
        setIsScrollSticky(true);
      } else {
        setIsScrollSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMakeHeaderSticky = () => {
    setIsTopSticky(true);
  };

  const handleMakeHeaderNonSticky = () => {
    setIsTopSticky(false);
  };

  return (
    <HeaderContext.Provider
      value={{
        isTopSticky,
        isScrollSticky,
        handleMakeHeaderSticky,
        handleMakeHeaderNonSticky,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error("HeaderContext must be used within a HeaderProvider");
  }
  return context;
};
