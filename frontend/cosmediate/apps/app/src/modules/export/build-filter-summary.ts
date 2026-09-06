import type { FilterConfig } from "@cosmediate/browse-manager";
import type { SortOption } from "@cosmediate/browse-manager";

function formatFilterValue(config: FilterConfig, value: unknown): string {
  if (value == null || value === "") return "";

  if (Array.isArray(value)) {
    if (!value.length) return "";
    const labels = value.map((entry) => {
      if (typeof entry === "object" && entry && "label" in entry) {
        return String((entry as { label?: string }).label ?? "");
      }
      const match = config.options?.find(
        (opt) => String(opt.value) === String(entry),
      );
      return match?.label ?? String(entry);
    });
    return labels.filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("from" in record || "to" in record) {
      const from = record.from ? String(record.from) : "—";
      const to = record.to ? String(record.to) : "—";
      return `${from} to ${to}`;
    }
    if ("label" in record) return String(record.label ?? "");
    return JSON.stringify(value);
  }

  const match = config.options?.find(
    (opt) => String(opt.value) === String(value),
  );
  return match?.label ?? String(value);
}

export function buildFilterSummary(input: {
  searchQuery: string;
  filterConfigs: FilterConfig[];
  activeFilters: Record<string, { value: unknown }>;
  sortBy: string;
  sortOrder: string;
  sortOptions?: SortOption[];
}): { filterLines: string[]; sortLine: string | null } {
  const filterLines: string[] = [];

  const query = input.searchQuery.trim();
  if (query) {
    filterLines.push(`Search: "${query}"`);
  }

  for (const config of input.filterConfigs) {
    const active = input.activeFilters[config.id];
    if (!active) continue;

    const formatted = formatFilterValue(config, active.value);
    if (!formatted) continue;

    filterLines.push(`${config.label}: ${formatted}`);
  }

  let sortLine: string | null = null;
  if (input.sortBy) {
    const option = input.sortOptions?.find(
      (entry) => entry.sortBy === input.sortBy && entry.order === input.sortOrder,
    );
    const label = option?.label ?? input.sortBy;
    sortLine = `Sort: ${label} (${input.sortOrder})`;
  }

  return { filterLines, sortLine };
}
