"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

import { HeaderProvider } from "@cosmediate/header/HeaderContext";
import AuthProvider from "@cosmediate/auth/AuthProvider";
import { Header } from "@cosmediate/header";
import { Footer } from "@cosmediate/footer";
import {
  MaintenanceGateProvider,
  NotificationBannerStack,
  NotificationProvider,
  USER_NOTIFICATION_REGISTRY,
  resolveDashboardAppUrl,
} from "@cosmediate/notifications";

import AppContextProvider from "@blog/context/AppContext";

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
          <MaintenanceGateProvider>
            <NotificationProvider
              surface="blog"
              registry={USER_NOTIFICATION_REGISTRY}
              guestSupport
              resolveActionHref={resolveDashboardAppUrl}
            >
              <NotificationBannerStack />
              <HeaderProvider>
                <Header />
                {children}
                <Footer />
              </HeaderProvider>
            </NotificationProvider>
          </MaintenanceGateProvider>
        </AuthProvider>
      </AppContextProvider>
    </NextThemesProvider>
  );
};
