import { EntityMetadata } from "./shared";

export type AppointmentStatus =
  | "upcoming"
  | "approved"
  | "cancelled"
  | "no show"
  | "past";

export interface Appointment extends EntityMetadata {
  specialist: {
    id: string;
    email: string;
    name: string;
    image: string;
    overviw: string;
    completeAddress: string;
  };

  clinic: {
    id: string;
    email: string;
    name: string;
    image: string;
    overviw: string;
    completeAddress: string;
  };

  treatment: {
    id: string;
    name: string;
    image: string;
    overviw: string;
    category: string;
    categoryId: string;
  };

  user: {
    id: string;
    name: string;
    image: string;
    phone: string;
    email: string;
    completeAddress: string;
  };

  metadata: {
    date: string;
    time: string;
    userMessage: string;
  };

  status: AppointmentStatus;
}
