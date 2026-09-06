"use client";

import Link from "next/link";

import { Button } from "@cosmediate/ui";
import { Eye } from "lucide-react";

import { hasPermission } from "@app/lib/permissions";

interface ViewOnlyActionButtonProps {
  perms: string[];
  viewHref: string;
  requiredGrant?: string;
}

export const ViewOnlyActionButton = ({
  perms,
  viewHref,
  requiredGrant = "platform:logs",
}: ViewOnlyActionButtonProps) => {
  if (!hasPermission(perms, requiredGrant)) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="outline" className="p-0">
        <Link
          href={viewHref}
          className="text-primary-accent hover:text-primary-accent max-lg:bg-ghost-blue px-3 py-2.5 rounded-lg"
        >
          <Eye />
        </Link>
      </Button>
    </div>
  );
};
