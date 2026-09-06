import { Appointment } from "@cosmediate/type-utils/appointment";

export const appointmentsMock: Appointment[] = [
  {
    id: "apt_001",
    entityType: "appointment",
    createdAt: "2026-02-01T09:10:00.000Z",
    updatedAt: "2026-02-01T09:10:00.000Z",

    specialist: {
      id: "spec_001",
      email: "sarah.jansen@cosmediate.com",
      name: "Dr. Sarah Jansen",
      image: "/avatar.jpg",
      overviw: "Cosmetic dermatologist with 12 years experience.",
      completeAddress: "Herengracht 12, Amsterdam, Netherlands",
    },

    clinic: {
      id: "clinic_001",
      email: "info@amsterdam-aesthetics.nl",
      name: "Amsterdam Aesthetics Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Premium aesthetic treatments in Amsterdam.",
      completeAddress: "Herengracht 12, Amsterdam, Netherlands",
    },

    treatment: {
      id: "treat_001",
      name: "Botox Forehead",
      image: "/treatment-placeholder.jpg",
      overviw: "Wrinkle relaxing botox injection.",
      category: "Injectables",
      categoryId: "cat_001",
    },

    user: {
      id: "user_001",
      name: "Emma Vermeer",
      image: "/avatar.jpg",
      phone: "+31 612345678",
      email: "emma.vermeer@email.com",
      completeAddress: "Keizersgracht 45, Amsterdam, Netherlands",
    },

    metadata: {
      date: "2026-03-10",
      time: "14:00",
      userMessage: "Interested in subtle natural results.",
    },

    status: "upcoming",
  },

  {
    id: "apt_002",
    entityType: "appointment",
    createdAt: "2026-01-15T11:00:00.000Z",
    updatedAt: "2026-01-20T08:00:00.000Z",

    specialist: {
      id: "spec_002",
      email: "michael.bakker@cosmediate.com",
      name: "Dr. Michael Bakker",
      image: "/avatar.jpg",
      overviw: "Specialist in facial contouring.",
      completeAddress: "Coolsingel 25, Rotterdam, Netherlands",
    },

    clinic: {
      id: "clinic_002",
      email: "contact@rotterdambeauty.nl",
      name: "Rotterdam Beauty Center",
      image: "/clinic-placeholder.jpg",
      overviw: "Modern cosmetic procedures.",
      completeAddress: "Coolsingel 25, Rotterdam, Netherlands",
    },

    treatment: {
      id: "treat_002",
      name: "Lip Filler",
      image: "/treatment-placeholder.jpg",
      overviw: "Hyaluronic acid lip augmentation.",
      category: "Injectables",
      categoryId: "cat_001",
    },

    user: {
      id: "user_002",
      name: "Liam De Vries",
      image: "/avatar.jpg",
      phone: "+31 634567890",
      email: "liam.devries@email.com",
      completeAddress: "Westblaak 78, Rotterdam, Netherlands",
    },

    metadata: {
      date: "2026-02-05",
      time: "10:30",
      userMessage: "First time doing lip fillers.",
    },

    status: "past",
  },

  {
    id: "apt_003",
    entityType: "appointment",
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-10T10:00:00.000Z",

    specialist: {
      id: "spec_003",
      email: "anne.vdberg@cosmediate.com",
      name: "Dr. Anne van der Berg",
      image: "/avatar.jpg",
      overviw: "Laser skin specialist.",
      completeAddress: "Neude 15, Utrecht, Netherlands",
    },

    clinic: {
      id: "clinic_003",
      email: "hello@utrechtlaser.nl",
      name: "Utrecht Laser Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Advanced laser treatments.",
      completeAddress: "Neude 15, Utrecht, Netherlands",
    },

    treatment: {
      id: "treat_003",
      name: "Laser Hair Removal",
      image: "/treatment-placeholder.jpg",
      overviw: "Permanent hair reduction.",
      category: "Laser",
      categoryId: "cat_002",
    },

    user: {
      id: "user_003",
      name: "Noah Smit",
      image: "/avatar.jpg",
      phone: "+31 645678901",
      email: "noah.smit@email.com",
      completeAddress: "Oudegracht 123, Utrecht, Netherlands",
    },

    metadata: {
      date: "2026-03-22",
      time: "16:00",
      userMessage: "Need 6 session package info.",
    },

    status: "approved",
  },

  {
    id: "apt_004",
    entityType: "appointment",
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-06T09:00:00.000Z",

    specialist: {
      id: "spec_001",
      email: "sarah.jansen@cosmediate.com",
      name: "Dr. Sarah Jansen",
      image: "/avatar.jpg",
      overviw: "Cosmetic dermatologist.",
      completeAddress: "Herengracht 12, Amsterdam, Netherlands",
    },

    clinic: {
      id: "clinic_001",
      email: "info@amsterdam-aesthetics.nl",
      name: "Amsterdam Aesthetics Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Premium aesthetic treatments.",
      completeAddress: "Herengracht 12, Amsterdam, Netherlands",
    },

    treatment: {
      id: "treat_004",
      name: "Chemical Peel",
      image: "/treatment-placeholder.jpg",
      overviw: "Skin resurfacing treatment.",
      category: "Skin",
      categoryId: "cat_003",
    },

    user: {
      id: "user_004",
      name: "Sophie Visser",
      image: "/avatar.jpg",
      phone: "+31 656789012",
      email: "sophie.visser@email.com",
      completeAddress: "Damrak 50, Amsterdam, Netherlands",
    },

    metadata: {
      date: "2026-01-25",
      time: "13:00",
      userMessage: "Sensitive skin concerns.",
    },

    status: "cancelled",
  },

  {
    id: "apt_005",
    entityType: "appointment",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-12T12:00:00.000Z",

    specialist: {
      id: "spec_002",
      email: "michael.bakker@cosmediate.com",
      name: "Dr. Michael Bakker",
      image: "/avatar.jpg",
      overviw: "Facial contouring expert.",
      completeAddress: "Coolsingel 25, Rotterdam, Netherlands",
    },

    clinic: {
      id: "clinic_002",
      email: "contact@rotterdambeauty.nl",
      name: "Rotterdam Beauty Center",
      image: "/clinic-placeholder.jpg",
      overviw: "Modern cosmetic procedures.",
      completeAddress: "Coolsingel 25, Rotterdam, Netherlands",
    },

    treatment: {
      id: "treat_005",
      name: "Jawline Filler",
      image: "/treatment-placeholder.jpg",
      overviw: "Jawline contour enhancement.",
      category: "Injectables",
      categoryId: "cat_001",
    },

    user: {
      id: "user_005",
      name: "Mila Van Dijk",
      image: "/avatar.jpg",
      phone: "+31 667890123",
      email: "mila.vandijk@email.com",
      completeAddress: "Blaak 10, Rotterdam, Netherlands",
    },

    metadata: {
      date: "2026-01-20",
      time: "15:30",
      userMessage: "Looking for sharper profile.",
    },

    status: "no show",
  },

  // 5 more simplified but valid entries
  {
    id: "apt_006",
    entityType: "appointment",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-05T09:00:00.000Z",
    specialist: {
      id: "spec_003",
      email: "anne.vdberg@cosmediate.com",
      name: "Dr. Anne van der Berg",
      image: "/avatar.jpg",
      overviw: "Laser specialist.",
      completeAddress: "Neude 15, Utrecht, Netherlands",
    },
    clinic: {
      id: "clinic_003",
      email: "hello@utrechtlaser.nl",
      name: "Utrecht Laser Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Advanced laser treatments.",
      completeAddress: "Neude 15, Utrecht, Netherlands",
    },
    treatment: {
      id: "treat_006",
      name: "Skin Rejuvenation",
      image: "/treatment-placeholder.jpg",
      overviw: "Laser skin renewal.",
      category: "Laser",
      categoryId: "cat_002",
    },
    user: {
      id: "user_006",
      name: "Lucas Janssen",
      image: "/avatar.jpg",
      phone: "+31 678901234",
      email: "lucas@email.com",
      completeAddress: "Utrecht, Netherlands",
    },
    metadata: {
      date: "2026-03-28",
      time: "11:00",
      userMessage: "Concerned about acne scars.",
    },
    status: "upcoming",
  },

  {
    id: "apt_007",
    entityType: "appointment",
    createdAt: "2026-02-06T10:00:00.000Z",
    updatedAt: "2026-02-06T10:00:00.000Z",
    specialist: {
      id: "spec_001",
      email: "sarah.jansen@cosmediate.com",
      name: "Dr. Sarah Jansen",
      image: "/avatar.jpg",
      overviw: "Cosmetic dermatologist.",
      completeAddress: "Amsterdam, Netherlands",
    },
    clinic: {
      id: "clinic_001",
      email: "info@amsterdam-aesthetics.nl",
      name: "Amsterdam Aesthetics Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Premium aesthetic treatments.",
      completeAddress: "Amsterdam, Netherlands",
    },
    treatment: {
      id: "treat_007",
      name: "Under Eye Filler",
      image: "/treatment-placeholder.jpg",
      overviw: "Tear trough filler.",
      category: "Injectables",
      categoryId: "cat_001",
    },
    user: {
      id: "user_007",
      name: "Olivia Bakker",
      image: "/avatar.jpg",
      phone: "+31 689012345",
      email: "olivia@email.com",
      completeAddress: "Amsterdam, Netherlands",
    },
    metadata: {
      date: "2026-02-28",
      time: "09:00",
      userMessage: "Dark circles issue.",
    },
    status: "approved",
  },

  {
    id: "apt_008",
    entityType: "appointment",
    createdAt: "2026-01-18T09:00:00.000Z",
    updatedAt: "2026-01-19T09:00:00.000Z",
    specialist: {
      id: "spec_002",
      email: "michael.bakker@cosmediate.com",
      name: "Dr. Michael Bakker",
      image: "/avatar.jpg",
      overviw: "Facial contouring expert.",
      completeAddress: "Rotterdam, Netherlands",
    },
    clinic: {
      id: "clinic_002",
      email: "contact@rotterdambeauty.nl",
      name: "Rotterdam Beauty Center",
      image: "/clinic-placeholder.jpg",
      overviw: "Modern cosmetic procedures.",
      completeAddress: "Rotterdam, Netherlands",
    },
    treatment: {
      id: "treat_008",
      name: "Chin Filler",
      image: "/treatment-placeholder.jpg",
      overviw: "Chin augmentation.",
      category: "Injectables",
      categoryId: "cat_001",
    },
    user: {
      id: "user_008",
      name: "Daan Peters",
      image: "/avatar.jpg",
      phone: "+31 690123456",
      email: "daan@email.com",
      completeAddress: "Rotterdam, Netherlands",
    },
    metadata: {
      date: "2026-01-30",
      time: "12:00",
      userMessage: "Profile balancing.",
    },
    status: "past",
  },

  {
    id: "apt_009",
    entityType: "appointment",
    createdAt: "2026-02-12T12:00:00.000Z",
    updatedAt: "2026-02-12T12:00:00.000Z",
    specialist: {
      id: "spec_003",
      email: "anne.vdberg@cosmediate.com",
      name: "Dr. Anne van der Berg",
      image: "/avatar.jpg",
      overviw: "Laser specialist.",
      completeAddress: "Utrecht, Netherlands",
    },
    clinic: {
      id: "clinic_003",
      email: "hello@utrechtlaser.nl",
      name: "Utrecht Laser Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Advanced laser treatments.",
      completeAddress: "Utrecht, Netherlands",
    },
    treatment: {
      id: "treat_009",
      name: "Tattoo Removal",
      image: "/treatment-placeholder.jpg",
      overviw: "Laser tattoo removal.",
      category: "Laser",
      categoryId: "cat_002",
    },
    user: {
      id: "user_009",
      name: "Finn Kuiper",
      image: "/avatar.jpg",
      phone: "+31 691234567",
      email: "finn@email.com",
      completeAddress: "Utrecht, Netherlands",
    },
    metadata: {
      date: "2026-04-02",
      time: "17:00",
      userMessage: "Old tattoo removal.",
    },
    status: "upcoming",
  },

  {
    id: "apt_010",
    entityType: "appointment",
    createdAt: "2026-01-02T08:00:00.000Z",
    updatedAt: "2026-01-02T08:00:00.000Z",
    specialist: {
      id: "spec_001",
      email: "sarah.jansen@cosmediate.com",
      name: "Dr. Sarah Jansen",
      image: "/avatar.jpg",
      overviw: "Cosmetic dermatologist.",
      completeAddress: "Amsterdam, Netherlands",
    },
    clinic: {
      id: "clinic_001",
      email: "info@amsterdam-aesthetics.nl",
      name: "Amsterdam Aesthetics Clinic",
      image: "/clinic-placeholder.jpg",
      overviw: "Premium aesthetic treatments.",
      completeAddress: "Amsterdam, Netherlands",
    },
    treatment: {
      id: "treat_010",
      name: "Hydrafacial",
      image: "/treatment-placeholder.jpg",
      overviw: "Deep cleansing facial.",
      category: "Skin",
      categoryId: "cat_003",
    },
    user: {
      id: "user_010",
      name: "Julia Meijer",
      image: "/avatar.jpg",
      phone: "+31 692345678",
      email: "julia@email.com",
      completeAddress: "Amsterdam, Netherlands",
    },
    metadata: {
      date: "2026-01-15",
      time: "10:00",
      userMessage: "Monthly facial routine.",
    },
    status: "past",
  },
];
