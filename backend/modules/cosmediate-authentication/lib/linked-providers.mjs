export function linkedProviderSlugArraysEqual(existing, authoritative) {
  const norm = (arr) =>
    [...(Array.isArray(arr) ? arr : [])]
      .map((x) => String(x).toLowerCase().trim())
      .filter(Boolean)
      .sort();

  const a = norm(existing);
  const b = norm(authoritative);

  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
