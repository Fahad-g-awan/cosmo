"use client";

import React from "react";

import AuditLogsBrowse from "@app/admin/sections/AuditTrail/pages/auditLogs/AuditLogsBrowse";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";

const AdminAuditLogsList = ({ adminId }: { adminId: string }) => (
  <AuditLogsBrowse
    basePath={`/control-panel/audit-logs/for/${adminId}`}
    scope={`admin-controlpanel-audit-logs-${adminId}`}
    lockedActorId={adminId}
    panelHeader={panelHeaderConfig.admin.controlPanel.auditLogs.byAdmin}
  />
);

export default AdminAuditLogsList;
