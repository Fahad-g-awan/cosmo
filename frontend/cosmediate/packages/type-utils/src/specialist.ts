import { EntityMetadata, EntitySharedData } from "./shared";
import { Clinic } from "./clinic";
import { Gender } from "./auth";

export type WorkingType = "FREELANCE" | "FULL_TIME";

export interface Specialist extends EntityMetadata, EntitySharedData {
  image: string;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  age: string;
  gender?: Gender;
  totalExperience?: string;

  country: string;
  state: string;
  city: string;
  completeAddress: string;
  postalCode: string;
  lat?: number;
  lon?: number;

  workingType: WorkingType;
  parentClinicId?: string;
  clinicIds?: string[];
  clinics?: Clinic[];

  role: "SPECIALIST";
  perms?: string[];
  cognitoSub?: string;
  passwordSet?: boolean;
  defaultPasswordUsed?: boolean;
  linkedProviders?: string[];

  entityType: "ENTITY_TYPE#SPECIALIST";
}
