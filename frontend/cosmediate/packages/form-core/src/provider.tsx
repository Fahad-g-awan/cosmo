"use client";

import React, { createContext, useContext, useRef, useCallback } from "react";
import type { FormStore } from "./store";
import type { CommitRegistry, CommitHandle } from "./types";

/**
 * Form store context
 */
const FormStoreContext = createContext<FormStore<
  Record<string, unknown>
> | null>(null);

/**
 * Commit registry context for sections that buffer state
 */
const CommitRegistryContext = createContext<CommitRegistry | null>(null);

/**
 * Get the form store from context (internal use)
 */
export function useFormStore<
  T extends Record<string, unknown>,
>(): FormStore<T> {
  const store = useContext(FormStoreContext);
  if (!store) {
    throw new Error("useFormStore must be used within a FormProvider");
  }
  return store as FormStore<T>;
}

/**
 * Get the commit registry from context
 */
export function useCommitRegistry(): CommitRegistry {
  const registry = useContext(CommitRegistryContext);
  if (!registry) {
    throw new Error("useCommitRegistry must be used within a FormProvider");
  }
  return registry;
}

interface FormProviderProps<T extends Record<string, unknown>> {
  store: FormStore<T>;
  children: React.ReactNode;
}

/**
 * Form provider component
 *
 * @example
 * const store = createFormStore({ initialValues, schema });
 *
 * <FormProvider store={store}>
 *   <MyForm />
 * </FormProvider>
 */
export function FormProvider<T extends Record<string, unknown>>({
  store,
  children,
}: FormProviderProps<T>) {
  // Commit registry for buffered sections
  const registryRef = useRef<Map<string, CommitHandle>>(new Map());

  const register = useCallback((key: string, handle: CommitHandle) => {
    registryRef.current.set(key, handle);
  }, []);

  const unregister = useCallback((key: string) => {
    registryRef.current.delete(key);
  }, []);

  const commitAll = useCallback(() => {
    let ok = true;
    for (const handle of registryRef.current.values()) {
      if (handle.commit() === false) ok = false;
    }
    return ok;
  }, []);

  const commit = useCallback((key: string) => {
    const handle = registryRef.current.get(key);
    if (!handle) return true;
    return handle.commit() !== false;
  }, []);

  const registry: CommitRegistry = {
    register,
    unregister,
    commitAll,
    commit,
  };

  return (
    <FormStoreContext.Provider
      value={store as FormStore<Record<string, unknown>>}
    >
      <CommitRegistryContext.Provider value={registry}>
        {children}
      </CommitRegistryContext.Provider>
    </FormStoreContext.Provider>
  );
}
