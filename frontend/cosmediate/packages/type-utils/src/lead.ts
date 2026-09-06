export type LeadSource =
  | "CONTACT_US_PAGE"
  | "SUBSCRIPTION"
  | "REGISTER_DOCTOR_FORM"
  | "REGISTER_CLINIC_FORM"
  | "FACEBOOK_AD"
  | "GOOGLE_AD"
  | "ORGANIC_SEARCH"
  | "PARTNER_REFERRAL"
  | "NEWSLETTER_CAMPAIGN";

export type LeadType = "SUBSCRIPTION" | "CONTACT" | "DOCTOR" | "CLINIC";

export type LeadStatus =
  | "NEW"
  | "PENDING_REVIEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CONVERTED"
  | "ARCHIVED"
  | "REJECTED";

export interface Lead {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;

  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  completeAddress?: string;

  subject?: string;
  message?: string;
  registrationNumber?: string;
  companyName?: string;
  recaptchaToken?: string;

  createdAt?: string;
  updatedAt?: string;

  status?: LeadStatus;
  type?: LeadType;
  source?: LeadSource;
}
