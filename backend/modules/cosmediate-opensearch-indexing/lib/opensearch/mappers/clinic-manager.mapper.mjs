import { getIdentityAuthFields, joinText } from "../documents.mjs";

export const mapClinicManagerSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    ...getIdentityAuthFields(data),
    image: data?.image || "",
    firstName: data?.firstName,
    lastName: data?.lastName,
    fullName: data?.fullName,
    phone: data?.phone,
    email: data?.email,
    age: data?.age,
    role: data?.role,
    country: data?.country,
    state: data?.state,
    city: data?.city,
    postalCode: data?.postalCode,
    completeAddress: data?.completeAddress,
    status: data?.status,
    perms: data?.perms,
    clinicIds: Array.isArray(data?.clinicIds) ? data.clinicIds : [],
    clinicCount: data?.clinicCount ?? 0,
    linkedProviders: data?.linkedProviders,
    defaultPasswordUsed: data?.defaultPasswordUsed,
    passwordSet: data?.passwordSet,
  };

  if (data?.lat != null && data?.lon != null) {
    doc.location = { lat: data.lat, lon: data.lon };
  }

  doc.searchableText = joinText([
    doc.fullName,
    doc.email,
    doc.phone,
    doc.country,
    doc.state,
    doc.city,
    doc.postalCode,
    doc.completeAddress,
  ]);

  return doc;
};
