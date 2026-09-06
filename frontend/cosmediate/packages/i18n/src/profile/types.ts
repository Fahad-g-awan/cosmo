export interface ProfileMessages {
  tabs: {
    general: string;
    about: string;
    treatments: string;
    price: string;
    doctors: string;
    reviews: string;
    faqs: string;
    contact: string;
    clinics: string;
  };
  sections: {
    readMore: string;
    viewAll: string;
    seeMore: string;
    qualityMarks: string;
    popularTreatments: string;
    doctors: string;
    beforeAfterPhotos: string;
    treatmentResults: string;
    popularClinics: string;
    workingAt: string;
    clinicPhotos: string;
    price: string;
    faqs: string;
    contactUs: string;
    address: string;
    website: string;
    instagram: string;
    workingHours: string;
    notAvailable: string;
    treatmentGuideTitle: (name: string) => string;
    specialistAt: string;
  };
  bookAppointment: {
    title: string;
    comingSoon: string;
    treatment: string;
    date: string;
    time: string;
    select: string;
    selectDate: string;
    commentPlaceholder: string;
    bookNow: string;
  };
  contact: {
    title: string;
    name: string;
    email: string;
    message: string;
    send: string;
    successToast: string;
    validation: {
      nameRequired: string;
      emailRequired: string;
      emailInvalid: string;
      messageRequired: string;
    };
  };
  cards: {
    explore: string;
    book: string;
    notAvailable: string;
    fromPrice: (price: number) => string;
    clinics: string;
    doctors: string;
    clinicLogoAlt: string;
    clinicImageAlt: string;
    specialistImageAlt: string;
  };
  empty: {
    clinic: string;
    specialist: string;
    treatment: string;
    doctors: string;
    clinics: string;
    treatments: string;
    noReviews: string;
    noReviewsHint: string;
    filterHint: string;
  };
  reviews: {
    title: string;
    authorName: string;
  };
}
