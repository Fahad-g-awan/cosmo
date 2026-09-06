import {
  TbBuildingHospital,
  TbCategory,
  TbFileChart,
  TbListDetails,
  TbPhoto,
  TbStethoscope,
  TbTag,
  TbTool,
  TbUser,
  TbUsers,
  TbUserShield,
} from "react-icons/tb";
import { CalendarDays, Megaphone, Shield, UserPlus, Users } from "lucide-react";
import { FiLock, FiSettings, FiUser } from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { BsFileText } from "react-icons/bs";
import type { IconType } from "react-icons";

/**
 * Shared section-nav icons — aligned with `navigationIcons.config.ts` root tabs.
 */
const icons = {
  clinics: HiOutlineChartBar,
  clinicCategories: TbCategory,
  clinicManagers: TbUsers,
  patients: TbBuildingHospital,
  patientRecords: Users,
  admins: TbUserShield,
  managers: TbUsers,
  auditLogs: TbFileChart,
  activity: TbFileChart,
  auditTrail: BsFileText,
  crm: Users,
  leads: UserPlus,
  blogs: BsFileText,
  blogCategories: TbCategory,
  treatments: MdOutlineHealthAndSafety,
  treatmentCategories: TbCategory,
  treatmentBrands: TbTag,
  treatmentResults: TbPhoto,
  specialists: FaUserDoctor,
  settings: FiSettings,
  account: FiUser,
  profile: TbUser,
  security: Shield,
  password: FiLock,
  platform: FiSettings,
  announcements: Megaphone,
  maintenance: TbTool,
  clinicSetup: TbBuildingHospital,
  workingHours: CalendarDays,
  certificates: Shield,
  faqs: BsFileText,
  tags: TbTag,
  treatmentSelection: TbCategory,
  assignSpecialists: TbUsers,
  subTreatments: TbListDetails,
  treatmentResultsSettings: TbPhoto,
  services: TbStethoscope,
} as const satisfies Record<string, IconType>;

export interface SectionNavItem {
  key: string;
  sectionTitle: string;
  label: string;
  path?: string;
  icon?: IconType;
  children?: SectionNavItem[];
}

export type SectionNavConfig = Record<string, Record<string, SectionNavItem[]>>;

export const sectionNavConfig: SectionNavConfig = {
  admin: {
    "clinic-management": [
      {
        key: "main",
        sectionTitle: "clinic management",
        label: "clinics",
        path: "/clinic-management",
        icon: icons.clinics,
      },
      {
        key: "categories",
        sectionTitle: "clinic management",
        label: "categories",
        path: "/clinic-management/categories",
        icon: icons.clinicCategories,
      },
      {
        key: "managers",
        sectionTitle: "clinic management",
        label: "managers",
        path: "/clinic-management/managers",
        icon: icons.clinicManagers,
      },
    ],

    patients: [
      {
        key: "patients",
        sectionTitle: "Patients",
        label: "Patients",
        icon: icons.patients,
        children: [
          {
            key: "all-records",
            sectionTitle: "Patients",
            label: "all records",
            path: "/patients",
            icon: icons.patientRecords,
          },
        ],
      },
    ],

    "control-panel": [
      {
        key: "admins",
        sectionTitle: "control panel",
        label: "admins",
        path: "/control-panel/admins",
        icon: icons.admins,
      },
      {
        key: "audit-logs",
        sectionTitle: "control panel",
        label: "audit logs",
        path: "/control-panel/audit-logs",
        icon: icons.auditLogs,
      },
    ],

    "activity-monitoring": [
      {
        key: "activity-monitoring",
        sectionTitle: "Activity Monitoring",
        label: "Activity Monitoring",
        icon: icons.activity,
        children: [
          {
            key: "all-logs",
            sectionTitle: "Activity Monitoring",
            label: "all logs",
            path: "/activity-monitoring",
            icon: icons.activity,
          },
        ],
      },
    ],

    "audit-trail": [
      {
        key: "audit-trail",
        sectionTitle: "Audit Trail",
        label: "Audit Trail",
        icon: icons.auditTrail,
        children: [
          {
            key: "all-records",
            sectionTitle: "Audit Trail",
            label: "all records",
            path: "/audit-trail",
            icon: icons.auditTrail,
          },
        ],
      },
    ],

    crm: [
      {
        key: "crm",
        sectionTitle: "CRM",
        label: "CRM",
        icon: icons.crm,
        children: [
          {
            key: "all-leads",
            sectionTitle: "CRM",
            label: "all leads",
            path: "/crm/leads",
            icon: icons.leads,
          },
        ],
      },
    ],

    "blog-management": [
      {
        key: "main",
        sectionTitle: "blogs management",
        label: "blogs management",
        path: "/blog-management",
        icon: icons.blogs,
      },
      {
        key: "categories",
        sectionTitle: "blogs management",
        label: "categories",
        path: "/blog-management/categories",
        icon: icons.blogCategories,
      },
    ],

    treatments: [
      {
        key: "main",
        sectionTitle: "treatment management",
        label: "all treatments",
        path: "/treatments",
        icon: icons.treatments,
      },
      {
        key: "categories",
        sectionTitle: "treatment management",
        label: "categories",
        path: "/treatments/categories",
        icon: icons.treatmentCategories,
      },
      {
        key: "brands",
        sectionTitle: "treatment management",
        label: "brands",
        path: "/treatments/brands",
        icon: icons.treatmentBrands,
      },
      {
        key: "results",
        sectionTitle: "treatment management",
        label: "results",
        path: "/treatments/results",
        icon: icons.treatmentResults,
      },
    ],

    specialists: [
      {
        key: "specialists",
        sectionTitle: "Specialists",
        label: "Specialists",
        icon: icons.specialists,
        children: [
          {
            key: "all-records",
            sectionTitle: "Specialists",
            label: "all records",
            path: "/specialists",
            icon: icons.specialists,
          },
        ],
      },
    ],

    settings: [
      {
        key: "account",
        sectionTitle: "settings",
        label: "account",
        icon: icons.account,
        children: [
          {
            key: "profile",
            sectionTitle: "settings",
            label: "profile",
            path: "/settings/account/profile",
            icon: icons.profile,
          },
          {
            key: "security",
            sectionTitle: "settings",
            label: "security",
            icon: icons.security,
            children: [
              {
                key: "manage-password",
                sectionTitle: "settings",
                label: "manage password",
                path: "/settings/account/security/manage-password",
                icon: icons.password,
              },
            ],
          },
        ],
      },
      {
        key: "platform",
        sectionTitle: "settings",
        label: "platform",
        icon: icons.platform,
        children: [
          {
            key: "announcements",
            sectionTitle: "settings",
            label: "announcements",
            path: "/settings/platform/announcements",
            icon: icons.announcements,
          },
          {
            key: "maintenance",
            sectionTitle: "settings",
            label: "maintenance",
            path: "/settings/platform/maintenance",
            icon: icons.maintenance,
          },
        ],
      },
    ],
  },

  manager: {
    "control-panel": [
      {
        key: "managers",
        sectionTitle: "control panel",
        label: "managers",
        path: "/control-panel/managers",
        icon: icons.managers,
      },
      {
        key: "audit-logs",
        sectionTitle: "control panel",
        label: "audit logs",
        path: "/control-panel/audit-logs",
        icon: icons.auditLogs,
      },
    ],

    patients: [
      {
        key: "patients",
        sectionTitle: "Patients",
        label: "Patients",
        icon: icons.patients,
        children: [
          {
            key: "all-records",
            sectionTitle: "Patients",
            label: "all records",
            path: "/patients",
            icon: icons.patientRecords,
          },
        ],
      },
    ],

    specialists: [
      {
        key: "specialists",
        sectionTitle: "Specialists",
        label: "Specialists",
        icon: icons.specialists,
        children: [
          {
            key: "all-records",
            sectionTitle: "Specialists",
            label: "all records",
            path: "/specialists",
            icon: icons.specialists,
          },
        ],
      },
    ],

    settings: [
      {
        key: "account",
        sectionTitle: "settings",
        label: "account",
        icon: icons.account,
        children: [
          {
            key: "profile",
            sectionTitle: "settings",
            label: "profile",
            path: "/settings/account/profile",
            icon: icons.profile,
          },
          {
            key: "security",
            sectionTitle: "settings",
            label: "security",
            icon: icons.security,
            children: [
              {
                key: "manage-password",
                sectionTitle: "settings",
                label: "manage password",
                path: "/settings/account/security/manage-password",
                icon: icons.password,
              },
            ],
          },
        ],
      },

      {
        key: "clinic-setup",
        sectionTitle: "settings",
        label: "clinic setup",
        icon: icons.clinicSetup,
        children: [
          {
            key: "clinic-setup-basic-information",
            sectionTitle: "settings",
            label: "basic information",
            path: "/settings/clinic-setup/basic-information",
            icon: icons.clinicSetup,
          },
          {
            key: "clinic-setup-working-hours",
            sectionTitle: "settings",
            label: "working hours",
            path: "/settings/clinic-setup/working-hours",
            icon: icons.workingHours,
          },
          {
            key: "clinic-setup-certificates",
            sectionTitle: "settings",
            label: "certificates",
            path: "/settings/clinic-setup/certificates",
            icon: icons.certificates,
          },
          {
            key: "clinic-setup-faqs",
            sectionTitle: "settings",
            label: "faqs",
            path: "/settings/clinic-setup/faqs",
            icon: icons.faqs,
          },
          {
            key: "clinic-setup-tags",
            sectionTitle: "settings",
            label: "tags",
            path: "/settings/clinic-setup/tags",
            icon: icons.tags,
          },
        ],
      },

      {
        key: "treatments-management",
        sectionTitle: "settings",
        label: "treatments management",
        icon: icons.treatments,
        children: [
          {
            key: "selection",
            sectionTitle: "settings",
            label: "treatment selection",
            path: "/settings/treatments-management/selection",
            icon: icons.treatmentSelection,
          },
          {
            key: "assign",
            sectionTitle: "settings",
            label: "assign specialists",
            path: "/settings/treatments-management/assign",
            icon: icons.assignSpecialists,
          },
          {
            key: "sub-treatments",
            sectionTitle: "settings",
            label: "sub treatments",
            path: "/settings/treatments-management/sub-treatments",
            icon: icons.subTreatments,
          },
          {
            key: "treatment-results",
            sectionTitle: "settings",
            label: "treatment results",
            path: "/settings/treatments-management/results",
            icon: icons.treatmentResultsSettings,
          },
        ],
      },
    ],
  },

  specialist: {
    patients: [
      {
        key: "patients",
        sectionTitle: "Patients",
        label: "Patients",
        icon: icons.patients,
        children: [
          {
            key: "all-records",
            sectionTitle: "Patients",
            label: "all records",
            path: "/patients",
            icon: icons.patientRecords,
          },
        ],
      },
    ],

    settings: [
      {
        key: "account",
        sectionTitle: "settings",
        label: "account",
        icon: icons.account,
        children: [
          {
            key: "profile",
            sectionTitle: "settings",
            label: "profile",
            path: "/settings/account/profile",
            icon: icons.profile,
          },
          {
            key: "security",
            sectionTitle: "settings",
            label: "security",
            icon: icons.security,
            children: [
              {
                key: "manage-password",
                sectionTitle: "settings",
                label: "manage password",
                path: "/settings/account/security/manage-password",
                icon: icons.password,
              },
            ],
          },
        ],
      },

      {
        key: "profile-setup",
        sectionTitle: "settings",
        label: "Advance Profile Setup",
        icon: icons.profile,
        children: [
          {
            key: "profile-setup-basic-information",
            sectionTitle: "settings",
            label: "basic information",
            path: "/settings/clinic-setup/basic-information",
            icon: icons.clinicSetup,
          },
          {
            key: "profile-setup-working-hours",
            sectionTitle: "settings",
            label: "working hours",
            path: "/settings/clinic-setup/working-hours",
            icon: icons.workingHours,
          },
          {
            key: "profile-setup-certificates",
            sectionTitle: "settings",
            label: "certificates",
            path: "/settings/clinic-setup/certificates",
            icon: icons.certificates,
          },
          {
            key: "profile-setup-faqs",
            sectionTitle: "settings",
            label: "faqs",
            path: "/settings/clinic-setup/faqs",
            icon: icons.faqs,
          },
          {
            key: "profile-setup-tags",
            sectionTitle: "settings",
            label: "tags",
            path: "/settings/clinic-setup/tags",
            icon: icons.tags,
          },
        ],
      },

      {
        key: "treatments-management",
        sectionTitle: "settings",
        label: "services",
        icon: icons.services,
        children: [
          {
            key: "services",
            sectionTitle: "settings",
            label: "services",
            path: "/settings/treatments-management/services",
            icon: icons.services,
          },
        ],
      },
    ],
  },

  patient: {
    appointments: [],
    inbox: [],
    settings: [
      {
        key: "profile",
        sectionTitle: "settings",
        label: "profile",
        path: "/settings/account/profile",
        icon: icons.profile,
      },
      {
        key: "security",
        sectionTitle: "settings",
        label: "security",
        icon: icons.security,
        children: [
          {
            key: "manage-password",
            sectionTitle: "settings",
            label: "manage password",
            path: "/settings/account/security/manage-password",
            icon: icons.password,
          },
        ],
      },
    ],
  },
};
