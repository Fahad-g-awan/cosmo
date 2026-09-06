export interface MarketingBenefit {
  title: string;
  description: string;
}

export interface MarketingMissionBlock {
  title: string;
  paragraphs: string[];
  linkLabel?: string;
  alt?: string;
}

export interface MarketingContactCard {
  title: string;
  paragraphs: string[];
}

export interface MarketingVacancyListItem {
  description: string;
}

export interface MarketingVacancySection {
  title: string;
  items: MarketingVacancyListItem[];
  footer?: string;
}

export interface MarketingMessages {
  shared: {
    missionNewsletter: {
      heading: string;
      statementLead: string;
      safe: string;
      honest: string;
      transparent: string;
      statementTail: string;
      stayInTouch: string;
      newsletterSubtitle: string;
      emailPlaceholder: string;
      send: string;
      toastInvalidEmail: string;
      toastSuccess: string;
      toastError: string;
    };
    benefits: {
      transparent: MarketingBenefit;
      safe: MarketingBenefit;
      accessible: MarketingBenefit;
    };
    partnerBenefits: {
      moreVisibility: MarketingBenefit;
      directBookings: MarketingBenefit;
      trustworthyReviews: MarketingBenefit;
      lowerMarketingCosts: MarketingBenefit;
    };
    registerBenefits: {
      moreOnlineVisibility: string;
      lowerMarketingCosts: string;
      directBookings: string;
      reliableReviews: string;
    };
    contactPrompt: string;
    applyNow: string;
    contactUsNow: string;
    signUp: string;
    benefitsHeadingClinic: string;
    benefitsHeadingRegisterClinic: string;
    benefitsHeadingRegisterDoctor: string;
    registerFollowUp: string;
    heroImageAlt: string;
    contactImageAlt: string;
    benefitImageAlt: string;
    dateFallback: string;
    blogImageFallback: string;
  };
  home: {
    hero: {
      title: string;
      subtitle: string;
      items: [string, string, string];
      heroImageAlt: string;
    };
    search: {
      tabs: {
        treatments: string;
        clinics: string;
        specialists: string;
      };
      placeholders: {
        treatments: string;
        clinics: string;
        specialists: string;
        dateTime: string;
        location: string;
      };
      searchButton: string;
    };
    popularClinics: string;
    popularTreatments: string;
    exploreCta: string;
    services: {
      headingLine1: string;
      headingLine2: string;
      exploreClinics: string;
      findTreatments: string;
      backgroundAlt: string;
      cards: Array<{
        title: string;
        description: string;
        subDescription: string;
      }>;
    };
    features: Array<{
      name: string;
      description: string;
      urlLabel: string;
    }>;
    testimonials: {
      registerTitleLine1: string;
      registerTitleLine2: string;
      registerBody1: string;
      registerBody2: string;
      registerCta: string;
      registerImageAlt: string;
      noReviewsTitle: string;
      noReviewsBody: string;
    };
    blog: {
      title: string;
      subtitle: string;
      readAllPosts: string;
    };
  };
  about: {
    pageTitle: string;
    breadcrumb: string;
    hero: {
      tagline: string;
      title: string;
      heroImageAlt: string;
    };
    mission: MarketingMissionBlock[];
  };
  contact: {
    pageTitle: string;
    introHeading: string;
    sectionHeading: string;
    sectionBody: string;
  };
  vacancies: {
    pageTitle: string;
    header: {
      title: string;
      description: string;
      tagLine: string;
    };
    vacancy: {
      title: string;
      secondaryTitle: string;
      paragraphs: string[];
    };
    sections: [MarketingVacancySection, MarketingVacancySection];
  };
  partnersClinics: {
    pageTitle: string;
    breadcrumb: string;
    hero: {
      title: string;
      secondaryText: string;
      imageAlt: string;
    };
    coreBenefits: {
      transparent: MarketingBenefit;
      safe: MarketingBenefit;
      accessible: MarketingBenefit;
    };
    contactCards: MarketingContactCard[];
  };
  registerClinic: {
    pageTitle: string;
    heroTitle: string;
  };
  registerDoctor: {
    pageTitle: string;
    heroTitle: string;
  };
}
