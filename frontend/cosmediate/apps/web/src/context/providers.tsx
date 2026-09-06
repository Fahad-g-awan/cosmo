"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeaderProvider } from "@cosmediate/header/HeaderContext";

import {
  MaintenanceGateProvider,
  NotificationBannerStack,
  NotificationProvider,
  USER_NOTIFICATION_REGISTRY,
  resolveDashboardAppUrl,
} from "@cosmediate/notifications";
import AuthProvider from "@cosmediate/auth/AuthProvider";
import WebSocketProvider from "@cosmediate/socket-setup";
import { Header } from "@cosmediate/header";
import { Footer } from "@cosmediate/footer";

import AppContextProvider from "@web/context/AppContext";
import { DialogProvider } from "./dialog/DialogProvider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthProvider>
        <MaintenanceGateProvider>
          <NotificationProvider
            surface="web"
            registry={USER_NOTIFICATION_REGISTRY}
            guestSupport
            resolveActionHref={resolveDashboardAppUrl}
          >
            <NotificationBannerStack />
            <WebSocketProvider>
              <DialogProvider>
                <AppContextProvider>
                  <HeaderProvider>
                    <Header />
                    {children}
                    <Footer />
                  </HeaderProvider>
                </AppContextProvider>
              </DialogProvider>
            </WebSocketProvider>
          </NotificationProvider>
        </MaintenanceGateProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
};
