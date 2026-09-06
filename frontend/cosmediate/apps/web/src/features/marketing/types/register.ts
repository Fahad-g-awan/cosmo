export type RegisterType = "doctor" | "clinic";

export type RegisterBenefit = {
  title: string;
  image: string;
};

export type RegisterData = {
  title: string;
  benefits: RegisterBenefit[];
};
