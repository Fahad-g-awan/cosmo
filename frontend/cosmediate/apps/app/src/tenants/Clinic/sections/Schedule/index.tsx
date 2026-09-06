"use client";

import React, { useEffect } from "react";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import { useAuth } from "@cosmediate/auth/index";

import {
  CalendarDays,
  CalendarRange,
  Clock,
  Timer,
  Ban,
  UserPlus,
  Repeat,
  CalendarPlus,
} from "lucide-react";

const Schedule = () => {
  const { setPanelHeaderConfig } = usePanelHeader();
  const { userRole } = useAuth();

  const panelConfig =
    userRole === "SPECIALIST"
      ? panelHeaderConfig.specialist.schedule
      : panelHeaderConfig.clinic.schedule;

  useEffect(() => {
    setPanelHeaderConfig(panelConfig);
  }, [setPanelHeaderConfig, userRole, panelConfig]);

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
            <CalendarDays className="w-10 h-10 text-primary-accent" />
          </div>

          {/* Title & Description */}
          <h2 className="text-2xl font-bold text-900 mb-2">Schedule</h2>
          <p className="text-sm text-700 max-w-lg text-center mb-8 leading-relaxed">
            Full-featured scheduling system with Month, Week, Day, and Today
            views. Manage open slots, book appointments, block time, and assign
            specialists — all synced across your clinic in real time.
          </p>
        </div>

        <div className="w-full sm:p-8 flex flex-col items-center justify-center">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-indigo-50 flex items-center justify-center">
                <CalendarRange className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Multi-View Calendar
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Switch between Month, Week, Day, and Today views to see your
                schedule at every zoom level
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CalendarPlus className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Open Slots
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Configure available time slots with custom recurrence,
                specialist assignment, and date ranges
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-sky-50 flex items-center justify-center">
                <Timer className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Appointment Booking
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Book with client details, treatment selection, time slots,
                custom durations, and notes
              </p>
            </div>

            <div className="group p-4 rounded-xl border border-100 bg-primary-accent/5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
              <div className="w-10 h-10 mb-3 rounded-lg bg-rose-50 flex items-center justify-center">
                <Ban className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-sm font-semibold text-900 mb-1">
                Time Blocking
              </h3>
              <p className="text-xs text-700 leading-relaxed">
                Block time ranges, handle cancellations with policy warnings,
                and mark no-shows
              </p>
            </div>
          </div>

          {/* Preview — Today's Schedule */}
          <div className="w-full rounded-xl border border-dashed border-100 bg-primary-accent/5 p-5 hover:border-primary-accent/20 hover:bg-primary-accent/[0.02] transition-all cursor-default">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-400" />
              <span className="text-xs font-semibold text-900 uppercase tracking-wider">
                Preview — Today&apos;s Schedule
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  time: "09:30",
                  client: "Drew Kim",
                  treatment: "Sclerotherapy",
                  icon: UserPlus,
                  color: "text-indigo-400",
                  bg: "bg-indigo-50",
                },
                {
                  time: "10:50",
                  client: "Casey Bennett",
                  treatment: "Mesotherapy",
                  icon: CalendarDays,
                  color: "text-emerald-400",
                  bg: "bg-emerald-50",
                },
                {
                  time: "12:30 – 14:00",
                  client: "Blocked Time",
                  treatment: "Tim Bouwman",
                  icon: Ban,
                  color: "text-400",
                  bg: "bg-100",
                },
                {
                  time: "15:30",
                  client: "Sam Rivera",
                  treatment: "Thread Lifts",
                  icon: Repeat,
                  color: "text-sky-400",
                  bg: "bg-sky-50",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 shrink-0 rounded-md ${item.bg} flex items-center justify-center mt-0.5`}
                  >
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-700 truncate">
                      {item.client}{" "}
                      <span className="text-primary-accent font-semibold">
                        {item.treatment}
                      </span>
                    </p>
                    <span className="text-[10px] text-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
