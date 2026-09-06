"use client";

import React, { useEffect } from "react";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";

import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  UserCheck,
  Clock,
  CircleDot,
  ListFilter,
  MessageSquareText,
  CalendarClock,
} from "lucide-react";

const AppointmentRequests = () => {
  const { setPanelHeaderConfig } = usePanelHeader();

  useEffect(() => {
    setPanelHeaderConfig(panelHeaderConfig.clinic.requests);
  }, [setPanelHeaderConfig]);

  return (
    <div className="w-full mx-auto">
      <div className="min-h-[520px] w-full flex flex-col items-center justify-center gap-5 bg-white rounded-xl sm:border sm:border-200 overflow-hidden">
        <div className="w-full sm:p-8 flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-accent-lite text-primary-accent text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-accent" />
            </span>
            In Development
          </div>

          {/* Hero Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-accent/5 to-primary-accent/1 border border-primary-accent/20 flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-primary-accent" />
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-900 mb-2">
            Appointment Requests
          </h2>
          <p className="text-sm text-700 max-w-lg text-center mb-8 leading-relaxed">
            Centralized intake for all incoming appointment requests. Review
            client details, assigned specialists, and treatment types — then
            approve, reject, or hold with a single click.
          </p>
        </div>

        <div className="w-full sm:p-8 flex flex-col items-center justify-center">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-sky-50 flex items-center justify-center">
                <ListFilter className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Status Tabs
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Filter by Incoming, Approved, Cancelled, and No-show to stay on
                top of every request
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Approval Workflow
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Approve, reject, or hide requests instantly with dedicated
                action buttons per row
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-violet-50 flex items-center justify-center">
                <MessageSquareText className="w-5 h-5 text-violet-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Client Details
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                See client name, email, phone, and personal message alongside
                each request
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-amber-50 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Treatment & Schedule
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                View requested treatment, assigned specialist, and preferred
                date & time at a glance
              </p>
            </div>
          </div>

          {/* Preview — Request Queue */}
          <div className="w-full rounded-xl border border-dashed border-100 bg-primary-accent/5 p-5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-400" />
              <span className="text-xs font-semibold text-900 uppercase tracking-wider">
                Preview — Request Queue
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  treatment: "Botox",
                  specialist: "Fleur de Jong",
                  client: "Lizza Schrader",
                  date: "Fri 23 May · 09:00",
                  status: "pending",
                  statusLabel: "Incoming",
                  statusColor: "bg-amber-50 text-amber-600",
                },
                {
                  treatment: "Laser Hair Removal",
                  specialist: "Thijs Hoekstra",
                  client: "Thomas Visser",
                  date: "Fri 24 May · 10:30",
                  status: "approved",
                  statusLabel: "Approved",
                  statusColor: "bg-emerald-50 text-emerald-600",
                },
                {
                  treatment: "IPL Therapy",
                  specialist: "Pieter Bakker",
                  client: "Tim Bouwman",
                  date: "Fri 25 May · 11:00",
                  status: "pending",
                  statusLabel: "Incoming",
                  statusColor: "bg-amber-50 text-amber-600",
                },
                {
                  treatment: "Microneedling",
                  specialist: "Eline de Bruijn",
                  client: "Sophie Scholten",
                  date: "Fri 27 May · 14:00",
                  status: "rejected",
                  statusLabel: "Cancelled",
                  statusColor: "bg-red-50 text-red-600",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-md bg-100 flex items-center justify-center">
                    {item.status === "pending" && (
                      <CircleDot className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {item.status === "approved" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {item.status === "rejected" && (
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-600 font-medium truncate">
                      {item.treatment}{" "}
                      <span className="text-400 font-normal">
                        — {item.specialist}
                      </span>
                    </p>
                    <span className="text-[10px] text-400">
                      {item.client} · {item.date}
                    </span>
                  </div>
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${item.statusColor}`}
                  >
                    {item.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentRequests;
