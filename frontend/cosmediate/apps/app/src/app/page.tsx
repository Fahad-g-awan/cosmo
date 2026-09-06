"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullScreenLoader } from "@cosmediate/ui/index";
import { parseError } from "@app/lib/utils";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const fetchDefaultRoute = async () => {
      try {
        const res = await fetch("/api/user/default-route", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data) {
          console.error("[RootPage] Failed to fetch default route");
          throw new Error("Unauthenticated Access");
        }

        if (!data.authenticated) {
          throw new Error("Unauthenticated Access");
        }

        // Redirect to user's role-based default route
        router.push(data.defaultRoute);
      } catch (error) {
        console.error("[RootPage] Error fetching default route", error);

        const signInUrl = new URL("/auth/signin", window.location.href);
        signInUrl.searchParams.set("error_description", parseError(error));
        router.push(signInUrl.toString());
      }
    };

    fetchDefaultRoute();
  }, [router]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <FullScreenLoader />
    </div>
  );
}
