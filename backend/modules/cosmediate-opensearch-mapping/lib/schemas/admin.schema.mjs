import {
  kw,
  kwNorm,
  text,
  textAC,
  geoPoint,
  Boolean,
  Integer,
} from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildAdminMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      image: kw(),
      phone: kw(),
      email: kwNorm(),
      age: Integer(),
      gender: kw(),
      firstName: textAC(),
      lastName: textAC(),
      fullName: textAC(),
      country: textAC(),
      state: textAC(),
      city: textAC(),
      postalCode: kw(),
      completeAddress: text(),
      location: geoPoint(),
      role: kw(),
      perms: kw(),
      status: kw(),
      linkedProviders: kw(),
      defaultPasswordUsed: Boolean(),
      passwordSet: Boolean(),
    },
  },
});
