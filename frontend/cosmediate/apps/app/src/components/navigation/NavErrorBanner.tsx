"use client";

import Link from "next/link";
import { useMemo } from "react";

import { getClientAppUrlFromHostname } from "@cosmediate/config";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";
import { Button } from "@cosmediate/ui";

import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";

interface NavErrorBannerProps {
  className?: string;
}

export const NavErrorBanner = ({ className }: NavErrorBannerProps) => {
  const { hasNavError, refetch } = usePlatformNavigation();
  const { handleLogout } = useAuth();

  const contactHref = useMemo(() => {
    if (typeof window === "undefined") return "/contact";
    const webOrigin = getClientAppUrlFromHostname(
      window.location.hostname,
      "web",
    );
    return `${webOrigin}/contact`;
  }, []);

  if (!hasNavError) return null;

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-danger/20 bg-danger/40 p-4 space-y-5",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-danger">
          Something went wrong loading navigation
        </p>
        <p className="text-xs text-danger">
          Your session is active, but we could not load menu permissions. Try
          again, sign in again, or contact support.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-xs"
        >
          Try again
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={handleLogout}
          className="text-xs"
        >
          Sign in again
        </Button>
        <Button
          type="button"
          size="sm"
          variant="link"
          asChild
          className="text-xs"
        >
          <Link href={contactHref} target="_blank" rel="noopener noreferrer">
            Contact support
          </Link>
        </Button>
      </div>
    </div>
  );
};
