"use client";

import React from "react";

import AuditLogsBrowse from "@app/admin/sections/AuditTrail/pages/auditLogs/AuditLogsBrowse";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";

const ManagerAuditLogsList = ({ managerId }: { managerId: string }) => (
  <AuditLogsBrowse
    basePath={`/control-panel/audit-logs/for/${managerId}`}
    scope={`clinic-controlpanel-audit-logs-${managerId}`}
    lockedActorId={managerId}
    panelHeader={panelHeaderConfig.clinic.controlPanel.auditLogs.byManager}
  />
);

export default ManagerAuditLogsList;
