"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeaderProvider } from "@cosmediate/header/HeaderContext";
import AuthProvider from "@cosmediate/auth/AuthProvider";
import WebSocketProvider from "@cosmediate/socket-setup";

import {
  MaintenanceGateProvider,
  NotificationBannerStack,
  NotificationProvider,
  USER_NOTIFICATION_REGISTRY,
} from "@cosmediate/notifications";

import { PlatformNavigationProvider } from "./PlatformNavigationContext";
import { DialogProvider } from "./dialog/DialogProvider";
import WorkspaceProvider from "./WorkspaceContext";
import AppContextProvider from "./AppContext";

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
        <MaintenanceGateProvider adminRecovery>
          <NotificationProvider
            surface="dashboard"
            registry={USER_NOTIFICATION_REGISTRY}
          >
            <NotificationBannerStack />
            <PlatformNavigationProvider>
              <WebSocketProvider>
                <AppContextProvider>
                  <WorkspaceProvider>
                    <HeaderProvider>
                      <DialogProvider>
                        {children}
                        {/* <DialogRenderer /> */}
                      </DialogProvider>
                    </HeaderProvider>
                  </WorkspaceProvider>
                </AppContextProvider>
              </WebSocketProvider>
            </PlatformNavigationProvider>
          </NotificationProvider>
        </MaintenanceGateProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
};
