import React from "react";

import type { ActivityLog } from "@cosmediate/type-utils";
import { DateTime } from "luxon";

import { formatLogActionLabel, formatLogEntityLabel } from "@app/lib/platform-logs";

import { Activity } from "lucide-react";
import { FiUser as User } from "react-icons/fi";

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  SOFT_DELETE: "bg-orange-100 text-orange-700",
};

export const HeaderSection = ({ log }: { log: ActivityLog }) => {
  return (
    <div className="w-full grid grid-cols-[130px_repeat(2,1fr)] max-sm:grid-cols-1 items-center gap-10 bg-gradient-lite-violet px-6 py-8">
      <div className="w-30 h-30 rounded-full border-4 border-primary-accent overflow-hidden bg-white flex items-center justify-center place-self-center">
        <Activity className="w-12 h-12 text-primary-accent" />
      </div>

      <div className="self-start text-center md:text-left text-800">
        <h1 className="text-2xl font-bold">{log.feedLine || "Activity log"}</h1>
        <p className="text-600 flex items-center justify-center md:justify-start gap-2 mt-1">
          <User className="w-4 h-4" />
          {log.actorDisplayName || log.actorEmail || log.actorId}
        </p>
        <span
          className={`inline-block mt-2 px-4 py-2 rounded-full text-xs font-medium uppercase ${
            actionColors[log.action] || "bg-100 text-800"
          }`}
        >
          {formatLogActionLabel(log.action)} · {formatLogEntityLabel(log.scope)}
        </span>
      </div>

      <div className="self-start text-center md:text-right text-sm text-600">
        <p>
          {log.occurredAt
            ? DateTime.fromISO(log.occurredAt).toFormat("dd MMM yyyy, HH:mm")
            : "N/A"}
        </p>
        <p className="mt-1 uppercase text-xs">{log.actorRole || "Unknown role"}</p>
      </div>
    </div>
  );
};
