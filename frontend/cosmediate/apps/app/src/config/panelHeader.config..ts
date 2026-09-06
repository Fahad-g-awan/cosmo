import type { PanelHeaderMap } from "@app/types/shared";

export const panelHeaderConfig = {
  // Admin config
  admin: {
    clinicManagement: {
      main: {
        pageTitle: "clinic management",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add clinic",
          link: "/clinic-management/add",
        },
      },
      record: {
        pageTitle: "clinic management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add clinic",
          link: "/clinic-management/add",
        },
      },
      add: {
        pageTitle: "clinic management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "clinic management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add clinic",
          link: "/clinic-management/add",
        },
      },

      categories: {
        main: {
          pageTitle: "clinic categories",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/clinic-management/categories/add",
          },
        },
        record: {
          pageTitle: "clinic categories",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/clinic-management/categories/add",
          },
        },
        add: {
          pageTitle: "clinic categories",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "clinic categories",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/clinic-management/categories/add",
          },
        },
      },

      managers: {
        main: {
          pageTitle: "clinic managers",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add manager",
            link: "/clinic-management/managers/add",
          },
        },
        record: {
          pageTitle: "clinic managers",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add manager",
            link: "/clinic-management/managers/add",
          },
        },
        add: {
          pageTitle: "clinic managers",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "clinic managers",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },

    specialists: {
      main: {
        pageTitle: "specialists",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
      record: {
        pageTitle: "specialists",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
      add: {
        pageTitle: "specialists",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "specialists",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
    },

    treatments: {
      main: {
        pageTitle: "treatments management",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add treatment",
          link: "/treatments/add",
        },
      },
      record: {
        pageTitle: "treatments management",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add treatment",
          link: "/treatments/add",
        },
      },
      add: {
        pageTitle: "treatments management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "treatments management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add treatment",
          link: "/treatments/add",
        },
      },
      categories: {
        main: {
          pageTitle: "treatment categories",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/treatments/categories/add",
          },
        },
        record: {
          pageTitle: "treatment categories",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/treatments/categories/add",
          },
        },
        add: {
          pageTitle: "treatment categories",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "treatment categories",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/treatments/categories/add",
          },
        },
      },
      results: {
        main: {
          pageTitle: "treatment results",
          showActions: true,
          showSearch: true,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add result",
            link: "/treatments/results/add",
          },
        },
        record: {
          pageTitle: "treatment results",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add result",
            link: "/treatments/results/add",
          },
        },
        add: {
          pageTitle: "treatment results",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "treatment results",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add result",
            link: "/treatments/results/add",
          },
        },
      },
      brands: {
        main: {
          pageTitle: "treatment brands",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add brand",
            link: "/treatments/brands/add",
          },
        },
        record: {
          pageTitle: "treatment brands",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add brand",
            link: "/treatments/brands/add",
          },
        },
        add: {
          pageTitle: "treatment brands",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "treatment brands",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add brand",
            link: "/treatments/brands/add",
          },
        },
      },
    },

    patients: {
      main: {
        pageTitle: "patients",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
      record: {
        pageTitle: "patients",
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        showActions: true,
        actionPath: {
          label: "add patients",
          link: "/patients/add",
        },
      },
      add: {
        pageTitle: "patients",
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        showActions: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "patients",
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        showActions: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },

    activityMonitoring: {
      main: {
        pageTitle: "activity monitoring",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      record: {
        pageTitle: "activity log",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },

    controlPanel: {
      admins: {
        main: {
          pageTitle: "Admins",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add admin",
            link: "/control-panel/admins/add",
          },
        },
        record: {
          pageTitle: "Admin Management",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add admin",
            link: "/control-panel/admins/add",
          },
        },
        add: {
          pageTitle: "Admin Management",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "Admin Management",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
      auditLogs: {
        main: {
          pageTitle: "audit logs",
          showActions: false,
          showSearch: true,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        record: {
          pageTitle: "audit log",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        byAdmin: {
          pageTitle: "admin audit logs",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },

    crm: {
      leads: {
        main: {
          pageTitle: "client leads",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        record: {
          pageTitle: "client leads",
          showActions: false,
          showSearch: true,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },

    auditTrail: {
      main: {
        pageTitle: "audit trail",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      record: {
        pageTitle: "audit log",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },

    moderation: {
      main: {
        pageTitle: "moderation",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },

    blogManagement: {
      main: {
        pageTitle: "blog management",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add blog",
          link: "/blog-management/add",
        },
      },
      record: {
        pageTitle: "blog management",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add blog",
          link: "/blog-management/add",
        },
      },
      add: {
        pageTitle: "blog management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "blog management",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "update blog",
          link: "/blog-management/update",
        },
      },
      categories: {
        main: {
          pageTitle: "blog categories",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/blog-management/categories/add",
          },
        },
        record: {
          pageTitle: "blog categories",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/blog-management/categories/add",
          },
        },
        add: {
          pageTitle: "blog categories",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "blog categories",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add category",
            link: "/blog-management/categories/add",
          },
        },
      },
    },

    leads: {
      main: {
        pageTitle: "leads",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },

    settings: {
      account: {
        profile: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        security: {
          managePassword: {
            pageTitle: "settings",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
        },
      },
      platform: {
        announcements: {
          main: {
            pageTitle: "announcements",
            showActions: true,
            showSearch: true,
            showExportBtn: true,
            showAddBtn: true,
            actionPath: {
              label: "add announcement",
              link: "/settings/platform/announcements/add",
            },
          },
          add: {
            pageTitle: "announcements",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
          update: {
            pageTitle: "announcements",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
        },
        maintenance: {
          pageTitle: "maintenance",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },
  },

  // Clinic manager config
  clinic: {
    analytics: {
      pageTitle: "analytics",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    requests: {
      pageTitle: "requests",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    inbox: {
      pageTitle: "inbox",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    schedule: {
      pageTitle: "schedule",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    reviews: {
      pageTitle: "reviews",
      showActions: false,
      showSearch: true,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    appointments: {
      pageTitle: "appointmen management",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    specialists: {
      main: {
        pageTitle: "specialists",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
      record: {
        pageTitle: "specialists",
        showActions: true,
        showSearch: false,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
      add: {
        pageTitle: "specialists",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "specialists",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add specialist",
          link: "/specialists/add",
        },
      },
    },

    patients: {
      main: {
        pageTitle: "patients",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
      record: {
        pageTitle: "patient profile",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
      add: {
        pageTitle: "add patient",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "update patient",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
    },

    controlPanel: {
      managers: {
        main: {
          pageTitle: "Managers",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: true,
          actionPath: {
            label: "add manager",
            link: "/control-panel/managers/add",
          },
        },
        record: {
          pageTitle: "Manager Profile",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: true,
          actionPath: {
            label: "add manager",
            link: "/control-panel/managers/add",
          },
        },
        add: {
          pageTitle: "Add Manager",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        update: {
          pageTitle: "Update Manager",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
      auditLogs: {
        main: {
          pageTitle: "audit logs",
          showActions: false,
          showSearch: true,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        record: {
          pageTitle: "audit log",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        byManager: {
          pageTitle: "manager audit logs",
          showActions: true,
          showSearch: true,
          showExportBtn: true,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },

    settings: {
      account: {
        profile: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        security: {
          managePassword: {
            pageTitle: "settings",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
        },
      },

      clinicProfile: {
        pageTitle: "settings",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },

      treatments: {
        selection: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        assign: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        subTreatments: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        results: {
          main: {
            pageTitle: "treatment results",
            showActions: true,
            showSearch: true,
            showExportBtn: true,
            showAddBtn: true,
            actionPath: {
              label: "add result",
              link: "/settings/treatments-management/results/add",
            },
          },
          record: {
            pageTitle: "treatment results",
            showActions: true,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: true,
            actionPath: {
              label: "add result",
              link: "/settings/treatments-management/results/add",
            },
          },
          add: {
            pageTitle: "treatment results",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
          update: {
            pageTitle: "treatment results",
            showActions: true,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: true,
            actionPath: {
              label: "add result",
              link: "/settings/treatments-management/results/add",
            },
          },
        },
      },

      appointments: {
        pageTitle: "settings",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },
  },

  // Clinic specialist config
  specialist: {
    analytics: {
      pageTitle: "analytics",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    requests: {
      pageTitle: "requests",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    inbox: {
      pageTitle: "inbox",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    schedule: {
      pageTitle: "schedule",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    reviews: {
      pageTitle: "reviews",
      showActions: false,
      showSearch: true,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    appointments: {
      pageTitle: "appointmen management",
      showActions: false,
      showSearch: false,
      showExportBtn: false,
      showAddBtn: false,
      actionPath: {
        label: "",
        link: "",
      },
    },

    patients: {
      main: {
        pageTitle: "patients",
        showActions: true,
        showSearch: true,
        showExportBtn: true,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
      record: {
        pageTitle: "patient profile",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
      add: {
        pageTitle: "add patient",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      update: {
        pageTitle: "update patient",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: true,
        actionPath: {
          label: "add patient",
          link: "/patients/add",
        },
      },
    },

    settings: {
      account: {
        profile: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        security: {
          managePassword: {
            pageTitle: "settings",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
        },
      },

      clinicProfile: {
        pageTitle: "settings",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },

      treatments: {
        selection: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        subTreatments: {
          pageTitle: "settings",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        results: {
          main: {
            pageTitle: "treatment results",
            showActions: false,
            showSearch: false,
            showExportBtn: false,
            showAddBtn: false,
            actionPath: {
              label: "",
              link: "",
            },
          },
        },
        services: {
          pageTitle: "services",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
        serviceDetail: {
          pageTitle: "service detail",
          showActions: false,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },

      appointments: {
        pageTitle: "settings",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },
  },

  // Patient dashboard config
  patient: {
    appointments: {
      main: {
        pageTitle: "",
        showActions: true,
        showSearch: true,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },
    inbox: {
      main: {
        pageTitle: "",
        showActions: false,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
    },
    settings: {
      profile: {
        pageTitle: "",
        showActions: true,
        showSearch: false,
        showExportBtn: false,
        showAddBtn: false,
        actionPath: {
          label: "",
          link: "",
        },
      },
      security: {
        managePassword: {
          pageTitle: "manage password",
          showActions: true,
          showSearch: false,
          showExportBtn: false,
          showAddBtn: false,
          actionPath: {
            label: "",
            link: "",
          },
        },
      },
    },
  },
} as const satisfies PanelHeaderMap;
