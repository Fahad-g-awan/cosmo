"use client";

import { useCallback, useEffect, useState } from "react";

import { getClinicApi } from "@cosmediate/api";
import type { Clinic } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

interface UseClinicEntityResult {
  clinic: Clinic | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClinicEntity(
  clinicId?: string | null,
): UseClinicEntityResult {
  const { session } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchClinic = useCallback(async () => {
    const id = clinicId ?? null;
    const accessToken = session?.tokens?.accessToken;

    if (!id || !accessToken) {
      setClinic(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getClinicApi({ id });
      if (response.success && response.item) {
        setClinic(response.item);
      } else {
        setClinic(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load clinic"));
      setClinic(null);
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, session?.tokens?.accessToken]);

  useEffect(() => {
    void fetchClinic();
  }, [fetchClinic]);

  return { clinic, isLoading, error, refetch: fetchClinic };
}
