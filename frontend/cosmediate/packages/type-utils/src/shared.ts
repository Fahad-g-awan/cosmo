import { JSONContent } from "@tiptap/react";
import { ProfileTreatmentAssignment } from "./treatments";
import { Review } from "./review";

export type JSONContentType = JSONContent;

export interface EntityMetadata {
  id: string;
  // PK: string;
  // SK: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deleted?: boolean;

  // GSI1PK?: string;
  // GSI1SK?: string;

  // GSI2PK?: string;
  // GSI2SK?: string;

  // GSI3PK?: string;
  // GSI3SK?: string;

  // GSI4PK?: string;
  // GSI4SK?: string;

  // GSI5PK?: string;
  // GSI5SK?: string;

  // GSI6PK?: string;
  // GSI6SK?: string;

  // GSI7PK?: string;
  // GSI7SK?: string;

  // GSI8PK?: string;
  // GSI8SK?: string;

  // GSI9PK?: string;
  // GSI9SK?: string;

  // GSI10PK?: string;
  // GSI10SK?: string;
}

export interface FAQs {
  question: string;
  answer: JSONContentType;
}

export interface Certificates {
  certificateImage?: string;
  name?: string;
  number?: string;
  issueDate?: string;
  validTill?: string;
  email?: string;
  certificateHolderFirstName?: string;
  certificateHolderLastName?: string;
}

export type WorkingHoursDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type WorkingHoursItem = {
  weekDay: WorkingHoursDay;
  startTime: string;
  endTime: string;
  available: boolean;
};

export type WorkingHours = WorkingHoursItem[];

export interface Location {
  country: string;
  state: string;
  city: string;
  postalCode: string;
  completeAddress: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
  instagramId: string;
}

export type Status = "ACTIVE" | "BLOCKED" | "PENDING";

export interface EntitySharedData extends Location, ContactInfo {
  overview: string;
  htmlAbout?: JSONContent;
  faqs?: FAQs[];
  tags?: string[];
  workingHours?: WorkingHours;
  certificates?: Certificates[];
  reviews?: Review[];

  location?: {
    lat: number;
    lon: number;
  };

  treatmentCategoryIds?: string[];
  brandIds?: string[];
  clinicSpecialistTreatmentIds?: string[];
  treatmentIds?: string[];

  treatments?: ProfileTreatmentAssignment[];

  treatmentCount?: number;
  clinicCount?: number;

  available?: boolean;
  status?: Status;

  searchClicks?: number;
  ratingSum?: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  avgRating?: number;
  reviewCount?: number;
}
