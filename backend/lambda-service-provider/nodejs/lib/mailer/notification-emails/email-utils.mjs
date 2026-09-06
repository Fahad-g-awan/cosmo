/**
 * Normalize and deduplicate email addresses (trimmed, lowercased).
 *
 * @param {string[]} emails
 * @returns {string[]}
 */
export const dedupeEmails = (emails) => {
  const seen = new Set();
  const result = [];

  for (const raw of emails ?? []) {
    const email = String(raw ?? "")
      .trim()
      .toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }

  return result;
};

/**
 * Diff two ID lists into added and removed entries.
 *
 * @param {string[]} previous
 * @param {string[]} next
 * @returns {{ added: string[], removed: string[] }}
 */
export const diffIdSets = (previous = [], next = []) => {
  const prev = new Set(previous.filter(Boolean));
  const nxt = new Set(next.filter(Boolean));

  return {
    added: [...nxt].filter((id) => !prev.has(id)),
    removed: [...prev].filter((id) => !nxt.has(id)),
  };
};
