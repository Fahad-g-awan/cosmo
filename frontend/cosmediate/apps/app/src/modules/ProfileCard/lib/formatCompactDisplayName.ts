/**
 * Compact a display name for tight UI (profile button).
 * Short names stay full. Longer multi-word names become
 * "Firstname M. S.". If the first word alone is too long, use initials.
 */
export function formatCompactDisplayName(
  fullName: string | undefined | null,
  maxLength = 18,
): string {
  const name = (fullName ?? "").trim().replace(/\s+/g, " ");
  if (!name) return "";
  if (name.length <= maxLength) return name;

  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) {
    const word = parts[0]!;
    if (word.length <= maxLength) return word;
    return `${word.slice(0, 1).toUpperCase()}.`;
  }

  const [first, ...rest] = parts;
  const withInitials = `${first} ${rest
    .map((word) => `${word.slice(0, 1).toUpperCase()}.`)
    .join(" ")}`;

  if (first!.length <= maxLength - 2 && withInitials.length <= maxLength + 4) {
    return withInitials;
  }

  return parts.map((word) => `${word.slice(0, 1).toUpperCase()}.`).join(" ");
}
