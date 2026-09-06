import { Clinic } from "./clinic";
import { EntityMetadata, FAQs, JSONContentType, Location } from "./shared";
import { Specialist } from "./specialist";

export interface TreatmentCategory extends EntityMetadata {
  id: string;
  name: string;
  published: boolean;
  treatmentCount?: number;
}

export interface TreatmentBrand extends EntityMetadata {
  id: string;
  name: string;
  published: boolean;
}

export interface Treatment extends EntityMetadata {
  categoryId: string;
  categoryName: string;
  name: string;
  image: string;
  htmlDescription?: JSONContentType;
  overview: string;
  recoveryTime?: string;
  anesthesia?: string;
  published: boolean;
  authorId: string;
  authorName: string;
  authorEmail: string;

  faqs?: FAQs[];
  tags?: string[];

  clinics?: Clinic[];
  specialists?: Specialist[];

  searchCount?: number;
  searchClicks?: number;
  clinicCount?: number;
  specialistCount?: number;
  brandIds?: string[];
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;

  entityType: "ENTITY_TYPE#TREATMENT";
}

/**
 * ClinicTreatment hub — clinic-owned offering of a master treatment.
 */
export interface ClinicTreatment {
  id: string;
  clinicId: string;
  treatmentId: string;
  status: string;
  categoryId: string;
  categoryName: string;
  treatmentName: string;
  treatmentImage?: string | null;
  treatmentOverview?: string | null;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Specialist assignment to a clinic offering.
 */
export interface ClinicSpecialistTreatment {
  id: string;
  clinicTreatmentId: string;
  clinicId: string;
  specialistId: string;
  treatmentId: string;
  categoryId: string;
  categoryName: string;
  treatmentName: string;
  treatmentImage?: string | null;
  treatmentOverview?: string | null;
  specialistExperience: string;
  status: string;
  available: boolean;
  minPrice?: number;
  maxPrice?: number;
  avgPrice?: number;
  searchClicks?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile-embedded treatment assignment (clinic/specialist GET detail).
 */
export interface ProfileTreatmentAssignment {
  id: string;
  clinicTreatmentId: string;
  treatmentId: string;
  categoryId?: string;
  categoryName?: string;
  treatmentName: string;
  treatmentImage?: string;
  treatmentOverview?: string;
  clinicId?: string;
  clinicName?: string;
  clinicLogo?: string;
  clinicCompleteAddress?: string;
  clinicAvgRating?: number;
  clinicReviewCount?: number;
  specialistId?: string;
  specialistName?: string;
  specialistImage?: string;
  specialistExperience?: string;
  completeAddress?: string;
  avgRating?: number;
  reviewCount?: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  subTreatmentCount?: number;
  subTreatments?: SubTreatment[];
  treatmentResults?: TreatmentResult[];
}

export interface SubTreatment extends EntityMetadata {
  clinicTreatmentId?: string;
  categoryId?: string;
  categoryName?: string;
  treatmentId?: string;
  clinicId?: string;
  name: string;
  price: number;
  duration: string;
  available: boolean;
  brands: TreatmentBrand[];
}

export interface CareOf {
  id: string;
  image: string;
  name: string;
  location: Location;
  role: string;
}

export type TreatmentResultOwnerType = "ADMIN" | "CLINIC";

export interface TreatmentResult extends EntityMetadata {
  id: string;
  ownerType: TreatmentResultOwnerType;
  clinicTreatmentId?: string;
  clinicId?: string;
  specialistId?: string;
  treatmentId: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  treatmentName?: string;
  treatmentImage?: string;
  treatmentOverview?: string;
}
