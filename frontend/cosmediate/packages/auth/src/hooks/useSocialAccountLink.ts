"use client";

import { useState, useCallback } from "react";

const DEFAULT_RETURN_TO = "/settings/account/security/manage-password";

interface UseSocialAccountLink {
  handleLinkGoogle: (returnTo?: string) => Promise<void>;
  isLinking: boolean;
}

export function useSocialAccountLink(): UseSocialAccountLink {
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkGoogle = useCallback(async (returnTo = DEFAULT_RETURN_TO) => {
    setIsLinking(true);
    try {
      const response = await fetch("/api/auth/oauth-link/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ returnTo, provider: "google" }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        authorizeUrl?: string;
        message?: string;
      } | null;

      if (!response.ok || !data?.success || !data.authorizeUrl) {
        throw new Error(
          data?.message || "Could not start Google account linking",
        );
      }

      window.location.href = data.authorizeUrl;
    } catch (error) {
      setIsLinking(false);
      throw error;
    }
  }, []);

  return { handleLinkGoogle, isLinking };
}
