import { normalizePhone } from "@app/lib/phone";

type InlineManager = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  gender?: string | null;
  age?: number | null;
  status?: string;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postalCode?: string | null;
  completeAddress?: string | null;
  perms?: string[];
};

const appendIfPresent = (
  formData: FormData,
  key: string,
  value: string | number | undefined | null,
) => {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
};

/** Maps embedded `newManager` form values to flat manager* multipart fields. */
export const appendInlineManagerToFormData = (
  formData: FormData,
  newManager: InlineManager,
) => {
  appendIfPresent(formData, "managerEmail", newManager.email);
  appendIfPresent(formData, "managerFirstName", newManager.firstName);
  appendIfPresent(formData, "managerLastName", newManager.lastName);
  appendIfPresent(
    formData,
    "managerPhone",
    normalizePhone(newManager.phone) ?? undefined,
  );
  appendIfPresent(formData, "managerGender", newManager.gender ?? undefined);
  appendIfPresent(formData, "managerAge", newManager.age ?? undefined);
  appendIfPresent(formData, "managerStatus", newManager.status);
  appendIfPresent(formData, "managerCountry", newManager.country ?? undefined);
  appendIfPresent(formData, "managerState", newManager.state ?? undefined);
  appendIfPresent(formData, "managerCity", newManager.city ?? undefined);
  appendIfPresent(
    formData,
    "managerPostalCode",
    newManager.postalCode ?? undefined,
  );
  appendIfPresent(
    formData,
    "managerCompleteAddress",
    newManager.completeAddress ?? undefined,
  );

  if (Array.isArray(newManager.perms) && newManager.perms.length > 0) {
    formData.append("managerPerms", JSON.stringify(newManager.perms));
  }
};
