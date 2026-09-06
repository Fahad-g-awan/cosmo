/**
 * TABLE UTILITIES
 *
 * NOTE: Table persistence is now handled by PreferencesProvider.
 * Table component is a pure controlled renderer with zero local state.
 *
 * This file is kept for any future table-specific utilities that don't
 * involve state management or persistence.
 */

// Generic debounce utility (may be useful for other purposes)
type GenericFunction = (...args: unknown[]) => unknown;

export function debounce<T extends GenericFunction>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
