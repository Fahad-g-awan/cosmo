import type { Metadata } from "next";

import { capitalizePageTitle } from "../utils";

export function dashboardTitle(title: string): Metadata {
  return {
    title: capitalizePageTitle(title),
    robots: { index: false, follow: false },
  };
}

export const DASHBOARD_SECTION_TITLES = {
  appointments: "Appointments",
  inbox: "Inbox",
  patients: "Patients",
  specialists: "Specialists",
  treatments: "Treatments",
  settings: "Settings",
  controlPanel: "Control Panel",
  clinicManagement: "Clinic Management",
  blogManagement: "Blog Management",
  moderation: "Moderation",
  crm: "CRM",
  auditTrail: "Audit Trail",
  activityMonitoring: "Activity Monitoring",
  analytics: "Analytics",
  schedule: "Schedule",
  requests: "Requests",
  reviews: "Reviews",
  addSpecialist: "Add Specialist",
  editSpecialist: "Edit Specialist",
  addPatient: "Add Patient",
  editPatient: "Edit Patient",
  addTreatment: "Add Treatment",
  editTreatment: "Edit Treatment",
  addClinic: "Add Clinic",
  editClinic: "Edit Clinic",
  editBlog: "Edit Article",
  leadDetails: "Lead Details",
  auditLog: "Audit Log",
  activityDetails: "Activity Details",
} as const;

export type DashboardSectionKey = keyof typeof DASHBOARD_SECTION_TITLES;

export function dashboardSectionTitle(key: DashboardSectionKey): Metadata {
  return dashboardTitle(DASHBOARD_SECTION_TITLES[key]);
}

export async function buildDashboardSpecialistMetadataById(
  id: string,
): Promise<Metadata> {
  const { fetchSpecialistServer } = await import("../fetch/server");
  const specialist = await fetchSpecialistServer(id);
  return dashboardTitle(specialist?.fullName ?? "Specialist");
}

export async function buildDashboardClinicMetadataById(
  id: string,
): Promise<Metadata> {
  const { fetchClinicServer } = await import("../fetch/server");
  const clinic = await fetchClinicServer(id);
  return dashboardTitle(clinic?.name ?? "Clinic");
}

export async function buildDashboardTreatmentMetadataById(
  id: string,
): Promise<Metadata> {
  const { fetchTreatmentServer } = await import("../fetch/server");
  const treatment = await fetchTreatmentServer(id);
  return dashboardTitle(treatment?.name ?? "Treatment");
}

export async function buildDashboardBlogMetadataById(
  id: string,
): Promise<Metadata> {
  const { fetchBlogServer } = await import("../fetch/server");
  const blog = await fetchBlogServer(id);
  return dashboardTitle(blog?.title ?? "Article");
}
