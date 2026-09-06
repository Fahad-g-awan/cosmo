import { getIdentityAuthFields, joinText } from "../documents.mjs";

export const mapAdminSearchDocument = (baseDoc, data) => {
  const doc = {
    ...baseDoc,
    ...getIdentityAuthFields(data),
    image: data?.image || "",
    firstName: data?.firstName,
    lastName: data?.lastName,
    fullName: data?.fullName,
    gender: data?.gender ?? undefined,
    phone: data?.phone,
    email: data?.email,
    age: data?.age,
    role: data?.role,
    country: data?.country,
    state: data?.state,
    city: data?.city,
    postalCode: data?.postalCode,
    completeAddress: data?.completeAddress,
    passwordSet: data?.passwordSet,
    defaultPasswordUsed: data?.defaultPasswordUsed,
    status: data?.status,
    perms: data?.perms,
    linkedProviders: data?.linkedProviders,
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
