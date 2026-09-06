import { EntityMetadata, EntitySharedData } from "./shared";
import { Specialist } from "./specialist";
import { ClinicManager } from "./auth";

export type ClinicType = "PARENT" | "NODE";

export interface ClinicCategory extends EntityMetadata {
  id: string;
  name: string;
  published: boolean;
  clinicCount?: number;
}

export interface Clinic extends EntityMetadata, EntitySharedData {
  logo: string;
  name: string;
  images: string[];
  clinicAge: string;
  clinicType?: ClinicType;

  categoryIds: string[];
  categories: ClinicCategory[];

  parentClinicId: string;
  managerIds: string[];
  specialistIds?: string[];
  specialists?: Partial<Specialist[]>;
  managers?: Partial<ClinicManager[]>;

  role: "CLINIC";

  searchClicks?: number;
  managerCount?: number;
  specialistCount?: number;

  entityType: "ENTITY_TYPE#CLINIC";
}
