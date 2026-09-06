"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  SectionLayoutLoader,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@cosmediate/auth";

import {
  resolveSectionKey,
  resolveActiveItem,
  getExpandedKeys,
  getAllParentKeys,
} from "./utils";
import { isMaintenanceOverlaySuppressedPath } from "@cosmediate/api";

import {
  buildSectionNavItems,
  filterSectionNavByPlatform,
  getSurfaceNavItems,
  resolveNavRootFromPath,
  surfaceForRole,
} from "@app/lib/platformNavigation";
import { usePlatformNavigation } from "@app/context/PlatformNavigationContext";
import { usePermissions } from "@app/hooks/usePermissions";
import { NavErrorBanner } from "@app/components/navigation/NavErrorBanner";
import { type SectionNavItem } from "@app/config/sectionNav.config";
import { sectionNavConfig } from "@app/config/sectionNav.config";
import MobileSectionNav from "./MobileSectionNav";

interface SectionNavigationProps {
  children: React.ReactNode;
  showMobileSectionNav: boolean;
  setShowMobileSectionNav: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMobileMenuBtn: React.Dispatch<React.SetStateAction<boolean>>;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  children,
  showMobileSectionNav,
  setShowMobileSectionNav,
  setShowMobileMenuBtn,
}) => {
  const { userRole, isSessionLoading } = useAuth();
  const { perms } = usePermissions();
  const {
    navigation,
    isLoading: isNavigationLoading,
    hasNavError,
  } = usePlatformNavigation();
  const pathname = usePathname();
  const isMaintenanceRecoveryPath =
    isMaintenanceOverlaySuppressedPath(pathname);

  const menuItems = useMemo((): SectionNavItem[] => {
    if (!userRole || isNavigationLoading) return [];

    const role = userRole.toLowerCase();
    const sectionKey = resolveSectionKey(pathname);
    const staticItems = sectionNavConfig[role]?.[sectionKey] ?? [];

    const surface = surfaceForRole(userRole);
    const platformItems = getSurfaceNavItems(
      navigation,
      surface,
      perms,
      userRole,
    );

    if (platformItems.length && staticItems.length) {
      return filterSectionNavByPlatform(staticItems, platformItems);
    }

    if (platformItems.length) {
      const navRoot = resolveNavRootFromPath(pathname, platformItems);
      if (navRoot) {
        return buildSectionNavItems(platformItems, navRoot.key, navRoot.label);
      }
    }

    if (isMaintenanceRecoveryPath && staticItems.length) {
      return staticItems;
    }

    return [];
  }, [
    isMaintenanceRecoveryPath,
    navigation,
    pathname,
    perms,
    userRole,
    isNavigationLoading,
  ]);

  const activePath = useMemo(
    () => resolveActiveItem(menuItems, pathname)?.path,
    [menuItems, pathname],
  );

  const activeItemLabel = useMemo(
    () => resolveActiveItem(menuItems, pathname)?.sectionTitle,
    [menuItems, pathname],
  );

  useEffect(() => {
    setShowMobileMenuBtn(menuItems?.length > 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  if (isSessionLoading || isNavigationLoading || !userRole) {
    return <SectionLayoutLoader />;
  }

  if (hasNavError && !isMaintenanceRecoveryPath) {
    return (
      <div className="w-full h-full flex flex-col gap-4 p-4">
        <NavErrorBanner />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full flex items-start justify-start gap-8 overflow-hidden",
        "max-lg:flex-col",
      )}
    >
      {menuItems?.length > 0 && (
        <>
          <DesktopNavItems
            menuItems={menuItems}
            activePath={activePath}
            className="max-lg:hidden"
          />

          <MobileSectionNav
            title={activeItemLabel as string}
            isOpen={showMobileSectionNav}
            onOpenChange={setShowMobileSectionNav}
          >
            <MobileNavItems menuItems={menuItems} activePath={activePath} />
          </MobileSectionNav>
        </>
      )}

      {/* <div className="w-full h-full px-1 overflow-y-auto overflow-x-hidden overflow-lite"> */}
      <div className="w-full h-[80dvh] pb overflow-y-auto overflow-lite px-1 overflow-x-hidden overflow-lite">
        {/* <div className="w-full h-full overflow-y-auto overflow-lite px-1 overflow-x-hidden overflow-lite"> */}
        {children}
      </div>
    </div>
  );
};

/**
 * =================================================================
 * Desktop Tree Nav
 * =================================================================
 */
const DesktopNavItems = ({
  className,
  menuItems,
  activePath,
}: {
  className?: string;
  menuItems: SectionNavItem[];
  activePath: string | undefined;
}) => {
  // Desktop: all expanded by default
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
    getAllParentKeys(menuItems),
  );

  const toggleKey = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div
      className={cn(
        "w-90 flex flex-col items-start justify-start max-lg:w-full",
        className,
      )}
    >
      <nav className="w-full flex flex-col gap-0.5 bg-primary-accent-lite rounded-lg py-1.5 pb-2 px-2 max-h-[500px] overflow-y-auto">
        {menuItems.map((item) => (
          <DesktopTreeItem
            key={item.key}
            item={item}
            level={0}
            activePath={activePath}
            expandedKeys={expandedKeys}
            toggleKey={toggleKey}
          />
        ))}
      </nav>
    </div>
  );
};

const DesktopTreeItem = ({
  item,
  level,
  activePath,
  expandedKeys,
  toggleKey,
}: {
  item: SectionNavItem;
  level: number;
  activePath: string | undefined;
  expandedKeys: Set<string>;
  toggleKey: (key: string) => void;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedKeys.has(item.key);
  const isActive = item.path && activePath === item.path;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleKey(item.key)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-3 rounded-md",
              "hover:bg-primary-accent/10 transition-colors cursor-pointer",
              "text-700 text-sm max-xl:text-xs font-medium capitalize",
            )}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-500 transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
            />
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {item.label}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="w-full flex flex-col gap-0.5">
            {item.children!.map((child) => (
              <DesktopTreeItem
                key={child.key}
                item={child}
                level={level + 1}
                activePath={activePath}
                expandedKeys={expandedKeys}
                toggleKey={toggleKey}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Leaf item with link
  return (
    <Link
      href={item.path || "#"}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-3 rounded-md text-xs font-medium capitalize",
        "transition-colors",
        isActive
          ? "bg-white text-primary-accent shadow-none"
          : "text-600 hover:bg-primary-accent/10 ",
      )}
      style={{ paddingLeft: `${12 + level * 16}px` }}
    >
      <span className="h-3.5 w-3.5 shrink-0" />
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {item.label}
    </Link>
  );
};

/**
 * =================================================================
 * Mobile Flat Nav
 * =================================================================
 */
const MobileNavItems = ({
  menuItems,
  activePath,
}: {
  menuItems: SectionNavItem[];
  activePath: string | undefined;
}) => {
  // Mobile: only active section expanded by default
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() =>
    getExpandedKeys(menuItems, activePath),
  );

  const toggleKey = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <nav className="w-full flex flex-col gap-0.5 px-2 pb-2 max-h-[400px] overflow-y-auto">
      {menuItems.map((item) => (
        <MobileTreeItem
          key={item.key}
          item={item}
          activePath={activePath}
          expandedKeys={expandedKeys}
          toggleKey={toggleKey}
        />
      ))}
    </nav>
  );
};

const MobileTreeItem = ({
  item,
  activePath,
  expandedKeys,
  toggleKey,
}: {
  item: SectionNavItem;
  activePath: string | undefined;
  expandedKeys: Set<string>;
  toggleKey: (key: string) => void;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedKeys.has(item.key);
  const isActive = item.path && activePath === item.path;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleKey(item.key)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium capitalize",
              "hover:bg-primary-accent/10 transition-colors cursor-pointer",
              "text-700 text-sm",
            )}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-500 transition-transform duration-200",
                isExpanded && "rotate-90",
              )}
            />
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {item.label}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-0.5">
            {item.children!.map((child) => (
              <MobileTreeItem
                key={child.key}
                item={child}
                activePath={activePath}
                expandedKeys={expandedKeys}
                toggleKey={toggleKey}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Leaf item
  return (
    <Link
      href={item.path || "#"}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium capitalize",
        "transition-colors",
        isActive
          ? "bg-white text-primary-accent shadow-none"
          : "text-600 hover:bg-primary-accent/10",
      )}
    >
      <span className="h-3.5 w-3.5 shrink-0" />
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {item.label}
    </Link>
  );
};

export default SectionNavigation;
