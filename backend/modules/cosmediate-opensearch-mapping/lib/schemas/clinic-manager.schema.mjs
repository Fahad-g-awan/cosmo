import {
  textAC,
  kw,
  kwNorm,
  geoPoint,
  Boolean,
  Integer,
} from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildClinicManagerMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      image: kw(),
      phone: kw(),
      email: kwNorm(),
      age: Integer(),
      firstName: textAC(),
      lastName: textAC(),
      fullName: textAC(),
      role: kw(),
      country: textAC(),
      state: textAC(),
      city: textAC(),
      postalCode: kw(),
      completeAddress: textAC(),
      location: geoPoint(),
      perms: kw(),
      status: kw(),
      defaultPasswordUsed: Boolean(),
      passwordSet: Boolean(),
      linkedProviders: kw(),
      clinicIds: kw(),
      clinicCount: Integer(),
    },
  },
});
