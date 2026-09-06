"use client";

import React from "react";
import { useCallback } from "react";
import { useStore } from "zustand";
import { useFormStore, useCommitRegistry } from "./provider";
import { get } from "./path";
import { isEqualNormalized } from "./deepEqualNormalized";

/**
 * Get a single value from the form store by path
 * Uses Zustand's selector for fine-grained subscriptions
 *
 * @example
 * const firstName = useFormValue<string>("firstName");
 * const faqQuestion = useFormValue<string>("faqs.0.question");
 */
export function useFormValue<T = unknown>(path: string): T {
  const store = useFormStore();
  return useStore(store, (state) =>
    get<T>(state.values as Record<string, unknown>, path)
  );
}

/**
 * Get the error for a specific path
 *
 * @example
 * const error = useFormError("firstName"); // "First name is required" | undefined
 */
export function useFormError(path: string): string | undefined {
  const store = useFormStore();
  return useStore(store, (state) => state.errors[path]);
}

/**
 * Get all form values
 * ⚠️ Use sparingly - subscribes to all value changes
 *
 * @example
 * const values = useFormValues<MyFormData>();
 */
export function useFormValues<T extends Record<string, unknown>>(): T {
  const store = useFormStore<T>();
  return useStore(store, (state) => state.values);
}

/**
 * Get all form errors
 *
 * @example
 * const errors = useFormErrors();
 */
export function useFormErrors(): Record<string, string> {
  const store = useFormStore();
  return useStore(store, (state) => state.errors);
}

/**
 * Get setValue function for updating form values
 * Returns a stable reference that won't cause re-renders
 *
 * @example
 * const setValue = useFormSetValue();
 * setValue("firstName", "John");
 */
export function useFormSetValue(): (path: string, value: unknown) => void {
  const store = useFormStore();
  return useStore(store, (state) => state.setValue);
}

/**
 * Get the validate function
 * Returns true if valid, false if errors
 *
 * @example
 * const validate = useFormValidate();
 * if (!validate()) {
 *   toast.error("Please fix validation errors");
 * }
 */
export function useFormValidate(): () => boolean {
  const store = useFormStore();
  const validateFromStore = useStore(store, (state) => state.validate);
  const commitAll = useFormCommitAll();

  return useCallback(() => {
    const commitsOk = commitAll();
    const schemaOk = validateFromStore();
    return commitsOk && schemaOk;
  }, [commitAll, validateFromStore]);
}

/**
 * Get the reset function
 *
 * @example
 * const reset = useFormReset();
 * reset(); // Reset to initial values
 * reset(newValues); // Reset to specific values
 */
export function useFormReset<T extends Record<string, unknown>>(): (
  values?: T
) => void {
  const store = useFormStore<T>();
  return useStore(store, (state) => state.reset);
}

/**
 * Get the touch function for marking fields as touched
 *
 * @example
 * const touch = useFormTouch();
 * <input onBlur={() => touch("firstName")} />
 */
export function useFormTouch(): (path: string) => void {
  const store = useFormStore();
  return useStore(store, (state) => state.touch);
}

/**
 * Get the submitting state and setter
 *
 * @example
 * const [isSubmitting, setIsSubmitting] = useFormSubmitting();
 * setIsSubmitting(true);
 */
export function useFormSubmitting(): [
  boolean,
  (isSubmitting: boolean) => void,
] {
  const store = useFormStore();
  const isSubmitting = useStore(store, (state) => state.isSubmitting);
  const setIsSubmitting = useStore(store, (state) => state.setIsSubmitting);
  return [isSubmitting, setIsSubmitting];
}

/**
 * Get commitAll function from the commit registry
 * Used to flush all buffered sections before validation
 *
 * @example
 * const commitAll = useFormCommitAll();
 * if (!commitAll()) return;
 * validate();
 */
export function useFormCommitAll(): () => boolean {
  const registry = useCommitRegistry();
  return useCallback(() => registry.commitAll(), [registry]);
}

/**
 * Register a commit handler for a buffered section
 * Use this in sections that buffer state (e.g., rich text editors)
 *
 * @example
 * useFormCommitRegister("about-section", {
 *   commit: () => setValue("htmlAbout", editorRef.current)
 * });
 */
export function useFormCommitRegister(
  key: string,
  handle: { commit: () => boolean | void },
) {
  const registry = useCommitRegistry();

  // Register on mount, unregister on unmount
  // Using a stable key ensures proper cleanup
  React.useEffect(() => {
    registry.register(key, handle);
    return () => registry.unregister(key);
  }, [key, handle, registry]);
}

export function useFormIsDirty(): boolean {
  const store = useFormStore();
  return useStore(
    store,
    (state) => !isEqualNormalized(state.values, state._initialValues)
  );
}
