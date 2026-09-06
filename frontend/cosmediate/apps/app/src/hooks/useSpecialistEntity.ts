"use client";

import { useCallback, useEffect, useState } from "react";

import type { Specialist } from "@cosmediate/type-utils";
import { getSpecialistApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

interface UseSpecialistEntityResult {
  specialist: Specialist | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSpecialistEntity(
  specialistId?: string | null,
): UseSpecialistEntityResult {
  const { session } = useAuth();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSpecialist = useCallback(async () => {
    const id = specialistId ?? null;
    const accessToken = session?.tokens?.accessToken;

    if (!id || !accessToken) {
      setSpecialist(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getSpecialistApi({ id });
      if (response.success && response.item) {
        setSpecialist(response.item);
      } else {
        setSpecialist(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load specialist"),
      );
      setSpecialist(null);
    } finally {
      setIsLoading(false);
    }
  }, [specialistId, session?.tokens?.accessToken]);

  useEffect(() => {
    void fetchSpecialist();
  }, [fetchSpecialist]);

  return { specialist, isLoading, error, refetch: fetchSpecialist };
}
