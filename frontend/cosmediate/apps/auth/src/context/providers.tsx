"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { HeaderProvider, useHeader } from "@cosmediate/header/HeaderContext";
import AuthProvider from "@cosmediate/auth/AuthProvider";
import { Header } from "@cosmediate/header";

import AppContextProvider from "@auth/context/AppContext";

const HeaderController = () => {
  const { handleMakeHeaderSticky } = useHeader();

  useEffect(() => {
    handleMakeHeaderSticky();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AppContextProvider>
        <AuthProvider>
          <HeaderProvider>
            <HeaderController />
            <Header />
            {children}
          </HeaderProvider>
        </AuthProvider>
      </AppContextProvider>
    </NextThemesProvider>
  );
};
