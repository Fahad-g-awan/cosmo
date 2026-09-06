"use client";

import { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import type { MarketingMessages } from "@cosmediate/i18n";

const ABOUT_HERO_IMAGE = "/marketing/about/heroImage.svg";
const ABOUT_BENEFIT_IMAGES = [
  "/marketing/about/TransparentIcon.svg",
  "/marketing/about/SafeIcon.svg",
  "/marketing/about/AccessibleIcon.svg",
] as const;

const ABOUT_MISSION_LAYOUT = [
  {
    kind: "card" as const,
    missionIndex: 0,
    image: "/marketing/about/CareIcon.svg",
    className: "col-span-2 max-lg:col-span-1",
  },
  {
    kind: "image" as const,
    missionIndex: 0,
    image: "/marketing/about/grid-img-1.svg",
    className: "col-span-1",
  },
  {
    kind: "card" as const,
    missionIndex: 1,
    image: "/marketing/about/PlatformIcon.svg",
    className: "col-span-1",
  },
  {
    kind: "card" as const,
    missionIndex: 2,
    image: "/marketing/about/VisionIcon.svg",
    className: "col-span-2 max-lg:col-span-1",
  },
  {
    kind: "card" as const,
    missionIndex: 3,
    image: "/marketing/about/AskIcon.svg",
    className: "col-span-2 max-lg:col-span-1",
    link: "/contact",
  },
  {
    kind: "image" as const,
    missionIndex: 3,
    image: "/marketing/about/grid-img-2.svg",
    className: "col-span-1",
  },
];

const PARTNER_HERO_IMAGE = "/marketing/partners/partners1.svg";
const PARTNER_BENEFIT_IMAGES = [
  "/marketing/partners/Icon1.svg",
  "/marketing/partners/Icon2.svg",
  "/marketing/partners/Icon3.svg",
  "/marketing/partners/VisibilityIcon.svg",
  "/marketing/partners/BookingIcon.svg",
  "/marketing/partners/ReviewIcon.svg",
  "/marketing/partners/MarketingIcon.svg",
] as const;

const PARTNER_CONTACT_IMAGES = [
  "/marketing/partners/SignUpIcon.svg",
  "/marketing/partners/ContactIcon.svg",
] as const;

const VACANCY_DETAILS_IMAGE = "/marketing/vacancies/CareIcon.svg";
const VACANCY_SECTION_ICONS = [
  [
    "/marketing/vacancies/ResponsibilityIcon.svg",
    "/marketing/vacancies/StrategyIcon.svg",
    "/marketing/vacancies/MonitorIcon.svg",
    "/marketing/vacancies/SalesIcon.svg",
    "/marketing/vacancies/OrganizationIcon.svg",
  ],
  [
    "/marketing/vacancies/EducationIcon.svg",
    "/marketing/vacancies/AffinityIcon.svg",
    "/marketing/vacancies/OpportunityIcon.svg",
    "/marketing/vacancies/MotivationIcon.svg",
    "/marketing/vacancies/LanguageIcon.svg",
    "/marketing/vacancies/AvailableIcon.svg",
    "/marketing/vacancies/BeautyIcon.svg",
    "/marketing/vacancies/DrinksIcon.svg",
  ],
] as const;

const REGISTER_BENEFIT_IMAGES = [
  "/marketing/partners/register/icon1.svg",
  "/marketing/partners/register/icon2.svg",
  "/marketing/partners/register/icon3.svg",
  "/marketing/partners/register/icon4.svg",
] as const;

function buildAboutMissionData(m: MarketingMessages) {
  return ABOUT_MISSION_LAYOUT.map((block) => {
    const mission = m.about.mission[block.missionIndex]!;

    if (block.kind === "image") {
      return {
        image: block.image,
        className: block.className,
        alt: mission.alt ?? "",
      };
    }

    return {
      image: block.image,
      className: block.className,
      title: mission.title,
      description: mission.paragraphs,
      link: block.link
        ? {
            href: block.link,
            linkLabel: mission.linkLabel ?? "",
            variant: "primary" as const,
          }
        : undefined,
    };
  });
}

export function useAboutPageData() {
  const m = useTranslations("marketing");

  return useMemo(
    () => ({
      heroData: {
        title: m.about.hero.title,
        tagline: m.about.hero.tagline,
        heroImage: ABOUT_HERO_IMAGE,
      },
      benefitsData: [
        {
          ...m.shared.benefits.transparent,
          image: ABOUT_BENEFIT_IMAGES[0],
        },
        { ...m.shared.benefits.safe, image: ABOUT_BENEFIT_IMAGES[1] },
        {
          ...m.shared.benefits.accessible,
          image: ABOUT_BENEFIT_IMAGES[2],
        },
      ],
      missionData: buildAboutMissionData(m),
    }),
    [m],
  );
}

export function usePartnerPageData() {
  const m = useTranslations("marketing");

  return useMemo(() => {
    const core = [
      m.partnersClinics.coreBenefits.transparent,
      m.partnersClinics.coreBenefits.safe,
      m.partnersClinics.coreBenefits.accessible,
    ];
    const extra = [
      m.shared.partnerBenefits.moreVisibility,
      m.shared.partnerBenefits.directBookings,
      m.shared.partnerBenefits.trustworthyReviews,
      m.shared.partnerBenefits.lowerMarketingCosts,
    ];

    return {
      heroData: {
        title: m.partnersClinics.hero.title,
        secondaryText: m.partnersClinics.hero.secondaryText,
        image: PARTNER_HERO_IMAGE,
      },
      benefitsData: [...core, ...extra].map((benefit, index) => ({
        ...benefit,
        image: PARTNER_BENEFIT_IMAGES[index] ?? "",
      })),
      contactData: m.partnersClinics.contactCards.map((card, index) => ({
        ...card,
        image: PARTNER_CONTACT_IMAGES[index] ?? "",
      })),
    };
  }, [m]);
}

export function useVacanciesPageData() {
  const m = useTranslations("marketing");

  return useMemo(
    () => ({
      headerData: m.vacancies.header,
      vacancyDetailsData: {
        image: VACANCY_DETAILS_IMAGE,
        title: m.vacancies.vacancy.title,
        secondaryTitle: m.vacancies.vacancy.secondaryTitle,
        description: m.vacancies.vacancy.paragraphs,
      },
      vacancyRequirementsData: m.vacancies.sections.map((section, index) => ({
        title: section.title,
        lists: section.items.map((item, itemIndex) => ({
          image: VACANCY_SECTION_ICONS[index]![itemIndex]!,
          description: item.description,
        })),
        description: section.footer ?? "",
      })),
    }),
    [m],
  );
}

export function useRegisterPageData(type: "clinic" | "doctor") {
  const m = useTranslations("marketing");

  return useMemo(() => {
    const page =
      type === "clinic" ? m.registerClinic : m.registerDoctor;
    const benefits = m.shared.registerBenefits;

    return {
      title: page.heroTitle,
      benefits: [
        { title: benefits.moreOnlineVisibility, image: REGISTER_BENEFIT_IMAGES[0] },
        { title: benefits.lowerMarketingCosts, image: REGISTER_BENEFIT_IMAGES[1] },
        { title: benefits.directBookings, image: REGISTER_BENEFIT_IMAGES[2] },
        { title: benefits.reliableReviews, image: REGISTER_BENEFIT_IMAGES[3] },
      ],
    };
  }, [m, type]);
}
