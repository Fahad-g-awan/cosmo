export function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return "";
  return value;
}

export function isEqualNormalized(a: unknown, b: unknown): boolean {
  const na = normalizeValue(a);
  const nb = normalizeValue(b);

  if (typeof na !== typeof nb) return false;

  if (typeof na !== "object" || na === null || nb === null) {
    return na === nb;
  }

  if (Array.isArray(na) !== Array.isArray(nb)) return false;

  if (Array.isArray(na)) {
    if (na.length !== (nb as unknown[]).length) return false;
    return na.every((v, i) => isEqualNormalized(v, (nb as unknown[])[i]));
  }

  const keysA = Object.keys(na as Record<string, unknown>);
  const keysB = Object.keys(nb as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    isEqualNormalized(
      (na as Record<string, unknown>)[key],
      (nb as Record<string, unknown>)[key]
    )
  );
}
