/** Maps a browse range-slider to backend `[min, max]` tuple on `field`. */
export const normalizeTupleRange = (
  value: unknown,
  field: string,
  out: Record<string, unknown>,
  { defaultMin, defaultMax }: { defaultMin?: number; defaultMax?: number } = {},
) => {
  if (!Array.isArray(value) || value.length !== 2) return;

  const min = Number(value[0]);
  const max = Number(value[1]);
  if (Number.isNaN(min) || Number.isNaN(max)) return;

  const minDefault = defaultMin ?? 0;
  const maxDefault = defaultMax ?? max;

  if (min === minDefault && max === maxDefault) return;
  out[field] = [min, max];
};

export const normalizeSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
};
