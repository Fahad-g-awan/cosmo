import { SectionNavItem } from "@app/config/sectionNav.config";

// Get the section key from the pathname
export const resolveSectionKey = (pathname: string): string => {
  return pathname.split("/")[1] ?? "";
};

// Flatten nested items to find the active leaf item by path
export const flattenItems = (items: SectionNavItem[]): SectionNavItem[] => {
  const result: SectionNavItem[] = [];
  for (const item of items) {
    if (item.path) result.push(item);
    if (item.children) result.push(...flattenItems(item.children));
  }
  return result;
};

// Find the active item by path
export const resolveActiveItem = (
  items: SectionNavItem[],
  pathname: string
) => {
  const flat = flattenItems(items);
  return flat
    .filter(
      (item) =>
        item.path &&
        (pathname === item.path || pathname.startsWith(item.path + "/"))
    )
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];
};

// Check if any descendant of an item has the active path
export const hasActiveDescendant = (
  item: SectionNavItem,
  activePath: string | undefined
): boolean => {
  if (!activePath) return false;
  if (
    item.path &&
    (activePath === item.path || activePath.startsWith(item.path + "/"))
  )
    return true;
  if (item.children) {
    return item.children.some((child) =>
      hasActiveDescendant(child, activePath)
    );
  }
  return false;
};

// Get all parent keys that should be expanded (contain the active item)
export const getExpandedKeys = (
  items: SectionNavItem[],
  activePath: string | undefined
): Set<string> => {
  const keys = new Set<string>();
  const walk = (nodes: SectionNavItem[]) => {
    for (const node of nodes) {
      if (node.children && hasActiveDescendant(node, activePath)) {
        keys.add(node.key);
        walk(node.children);
      }
    }
  };
  walk(items);
  return keys;
};

// Get all parent keys (for "expand all by default" on desktop)
export const getAllParentKeys = (items: SectionNavItem[]): Set<string> => {
  const keys = new Set<string>();
  const walk = (nodes: SectionNavItem[]) => {
    for (const node of nodes) {
      if (node.children) {
        keys.add(node.key);
        walk(node.children);
      }
    }
  };
  walk(items);
  return keys;
};
