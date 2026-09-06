export type BrowseMonthLabels = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface BrowseMessages {
  search: {
    submit: string;
    label: string;
    placeholder: string;
    clinics: string;
    specialists: string;
    treatments: string;
    blogs: string;
    location: string;
    cityOrPostal: string;
    locationInputPlaceholder: string;
    locationHint: string;
    locationNoResults: string;
    locationError: string;
    datetime: string;
    selectDateAndTime: string;
  };
  filters: {
    title: string;
    clearAll: string;
    apply: string;
    clear: string;
    enableLocation: string;
    enablingLocation: string;
    clearFilterTitle: string;
    months: BrowseMonthLabels;
    date: {
      from: string;
      to: string;
    };
    labels: {
      appointment: string;
      location: string;
      budget: string;
      brands: string;
      clinicCategories: string;
      treatmentCategories: string;
      treatment: string;
      clinic: string;
      clinicAge: string;
      experience: string;
      minimumRating: string;
      distance: string;
      blogCategories: string;
      month: string;
      year: string;
      publishedDate: string;
    };
    placeholders: {
      allTreatments: string;
      allClinics: string;
      select: string;
    };
    rating: {
      veryGood: string;
      good: string;
      proper: string;
      adequate: string;
    };
  };
  sort: {
    placeholder: string;
    newest: string;
    oldest: string;
    topSearched: string;
    nameAsc: string;
    nameDesc: string;
    highestRated: string;
    priceAsc: string;
    priceDesc: string;
  };
  view: {
    grid: string;
    list: string;
  };
  pagination: {
    showing: string;
    of: string;
    records: string;
    perPage: string;
  };
  empty: {
    noResultsHint: string;
    refreshHint: string;
    clinics: string;
    specialists: string;
    treatments: string;
    blogs: string;
  };
}
