import { useMemo } from "react";

import {
  getAdminsApi,
  getClinicManagersApi,
  getManagementBlogCategoriesApi,
  getManagementBlogsApi,
  getManagementBrandsApi,
  getManagementClinicCategoriesApi,
  getManagementClinicsApi,
  getManagementSpecialistsApi,
  getManagementTreatmentCategoriesApi,
  getManagementTreatmentsApi,
} from "@cosmediate/api";
import type {
  Treatment,
  TreatmentBrand,
  TreatmentCategory,
} from "@cosmediate/type-utils";
import type { Clinic, ClinicCategory } from "@cosmediate/type-utils/clinic";
import type { AsyncFilterFetchFn } from "@cosmediate/browse-manager";
import type { Specialist } from "@cosmediate/type-utils/specialist";
import type { ClinicManager } from "@cosmediate/type-utils/auth";
import type { BlogCategory } from "@cosmediate/type-utils/blog";
import type { Admin } from "@cosmediate/type-utils/auth";
import { useAuth } from "@cosmediate/auth";

import {
  createManagementListFetcher,
  PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
  type PaginatedAsyncFetchFn,
} from "@app/modules/PaginatedAsyncSelect";

function toAsyncFilterFetch(
  fetchPage: PaginatedAsyncFetchFn,
): AsyncFilterFetchFn {
  return async (params) => {
    const result = await fetchPage(params);
    return {
      items: result.items.map((item) => ({
        value: item.value,
        label:
          typeof item.label === "string"
            ? item.label
            : String(item.searchText ?? item.value),
      })),
      nextToken: result.nextToken,
    };
  };
}

export function useBlogCategoryListFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<BlogCategory>({
      fetchList: getManagementBlogCategoriesApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (category) => ({
        value: category.id,
        label: category.name,
        searchText: category.name,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useTreatmentCategoryListFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<TreatmentCategory>({
      fetchList: getManagementTreatmentCategoriesApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (category) => ({
        value: category.id,
        label: category.name,
        searchText: category.name,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useTreatmentListFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Treatment>({
      fetchList: getManagementTreatmentsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (treatment) => ({
        value: treatment.id,
        label: treatment.name,
        searchText: treatment.name,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useBlogCategoryFormFetcher() {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(
    () =>
      createManagementListFetcher<BlogCategory>({
        fetchList: getManagementBlogCategoriesApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        mapOption: (category) => ({
          value: category.id,
          label: category.name,
          searchText: category.name,
        }),
      }),
    [accessToken],
  );
}

export function useTreatmentCategoryFormFetcher() {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(
    () =>
      createManagementListFetcher<TreatmentCategory>({
        fetchList: getManagementTreatmentCategoriesApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        mapOption: (category) => ({
          value: category.id,
          label: category.name,
          searchText: category.name,
        }),
      }),
    [accessToken],
  );
}

export function useTreatmentFormFetcher() {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(
    () =>
      createManagementListFetcher<Treatment>({
        fetchList: getManagementTreatmentsApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        mapOption: (treatment) => ({
          value: treatment.id,
          label: treatment.name,
          searchText: treatment.name,
        }),
      }),
    [accessToken],
  );
}

export function useClinicCategoryFormFetcher() {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(
    () =>
      createManagementListFetcher<ClinicCategory>({
        fetchList: getManagementClinicCategoriesApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        mapOption: (category) => ({
          value: category.id,
          label: category.name,
          searchText: category.name,
        }),
      }),
    [accessToken],
  );
}

export function useClinicCategoryListFetcher(): AsyncFilterFetchFn {
  const fetchPage = useClinicCategoryFormFetcher();
  return useMemo(() => toAsyncFilterFetch(fetchPage), [fetchPage]);
}

export function useBrandListFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<TreatmentBrand>({
      fetchList: getManagementBrandsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (brand) => ({
        value: brand.id,
        label: brand.name,
        searchText: brand.name,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useParentClinicBrowseFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Clinic>({
      fetchList: getManagementClinicsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      filters: { clinicType: "PARENT" },
      mapOption: (clinic) => ({
        value: clinic.id,
        label: clinic.name,
        searchText: `${clinic.name} ${clinic.city ?? ""} ${clinic.completeAddress ?? ""}`,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useClinicBrowseFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Clinic>({
      fetchList: getManagementClinicsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (clinic) => ({
        value: clinic.id,
        label: clinic.name,
        searchText: `${clinic.name} ${clinic.city ?? ""} ${clinic.completeAddress ?? ""}`,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useClinicFormFetcher() {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(
    () =>
      createManagementListFetcher<Clinic>({
        fetchList: getManagementClinicsApi,
        accessToken,
        pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
        mapOption: (clinic) => ({
          value: clinic.id,
          label: `${clinic.name}${clinic.completeAddress ? ` - ${clinic.completeAddress}` : ""}`,
          searchText: `${clinic.name} ${clinic.completeAddress ?? ""} ${clinic.city ?? ""}`,
        }),
      }),
    [accessToken],
  );
}

/**
 * Clinics within a parent org domain (parent + nodes).
 * Uses OpenSearch `clinicId` scope: id === root OR parentClinicId === root.
 */
export function useClinicDomainFormFetcher(orgRootClinicId?: string | null) {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const scopeId = orgRootClinicId?.trim() || null;

  return useMemo(() => {
    if (!accessToken) {
      return async () => ({ items: [], nextToken: null });
    }

    return createManagementListFetcher<Clinic>({
      fetchList: (body, token) =>
        getManagementClinicsApi(
          {
            ...body,
            filters: {
              ...body.filters,
              ...(scopeId ? { clinicId: scopeId } : {}),
            },
          },
          token,
        ),
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (clinic) => ({
        value: clinic.id,
        label: `${clinic.name}${clinic.completeAddress ? ` - ${clinic.completeAddress}` : ""}`,
        searchText: `${clinic.name} ${clinic.completeAddress ?? ""} ${clinic.city ?? ""}`,
      }),
    });
  }, [accessToken, scopeId]);
}

/**
 * Clinics within the manager's org domain (effective scope from session).
 */
export function useClinicOrgFormFetcher(orgClinicIds: string[] = []) {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const orgClinicIdsKey = orgClinicIds.slice().sort().join(",");

  return useMemo(() => {
    if (!accessToken || !orgClinicIds.length) {
      return async () => ({ items: [], nextToken: null });
    }

    return createManagementListFetcher<Clinic>({
      fetchList: (body, token) =>
        getManagementClinicsApi(
          {
            ...body,
            filters: {
              ...body.filters,
              clinicIds: orgClinicIds,
            },
          },
          token,
        ),
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (clinic) => ({
        value: clinic.id,
        label: `${clinic.name}${clinic.completeAddress ? ` - ${clinic.completeAddress}` : ""}`,
        searchText: `${clinic.name} ${clinic.completeAddress ?? ""} ${clinic.city ?? ""}`,
      }),
    });

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [accessToken, orgClinicIdsKey]);
}

export function useClinicOrgBrowseFetcher(orgClinicIds: string[] = []) {
  const fetchPage = useClinicOrgFormFetcher(orgClinicIds);
  return useMemo(() => toAsyncFilterFetch(fetchPage), [fetchPage]);
}

export function useAdminBrowseFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Admin>({
      fetchList: getAdminsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (admin) => ({
        value: admin.id,
        label: admin.fullName || `${admin.firstName} ${admin.lastName}`,
        searchText: `${admin.fullName ?? ""} ${admin.email ?? ""}`,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useSpecialistClinicBrowseFetcher(
  scopedClinicId?: string | null,
): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Specialist>({
      fetchList: (body, token) =>
        getManagementSpecialistsApi(
          {
            ...body,
            filters: {
              ...body.filters,
              ...(scopedClinicId ? { clinicId: scopedClinicId } : {}),
            },
          },
          token,
        ),
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (specialist) => ({
        value: specialist.id,
        label:
          specialist.fullName ||
          `${specialist.firstName} ${specialist.lastName}`,
        searchText: specialist.fullName ?? specialist.email,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken, scopedClinicId]);
}

export function useSpecialistLinkedClinicsBrowseFetcher(
  clinicIds: string[] = [],
): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const clinicIdsKey = clinicIds.slice().sort().join(",");

  return useMemo(() => {
    if (!accessToken || !clinicIds.length) {
      return async () => ({ items: [], nextToken: null });
    }

    const fetchPage = createManagementListFetcher<Clinic>({
      fetchList: (body, token) =>
        getManagementClinicsApi(
          {
            ...body,
            filters: {
              ...body.filters,
              clinicIds,
            },
          },
          token,
        ),
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (clinic) => ({
        value: clinic.id,
        label: clinic.name,
        searchText: `${clinic.name} ${clinic.city ?? ""} ${clinic.completeAddress ?? ""}`,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken, clinicIdsKey]);
}

export function useSpecialistBrowseFetcher(): AsyncFilterFetchFn {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    const fetchPage = createManagementListFetcher<Specialist>({
      fetchList: getManagementSpecialistsApi,
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (specialist) => ({
        value: specialist.id,
        label:
          specialist.fullName ||
          `${specialist.firstName} ${specialist.lastName}`,
        searchText: specialist.fullName ?? specialist.email,
      }),
    });
    return toAsyncFilterFetch(fetchPage);
  }, [accessToken]);
}

export function useClinicManagersFormFetcher(parentClinicId?: string) {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  return useMemo(() => {
    if (!accessToken || !parentClinicId) {
      return async () => ({ items: [], nextToken: null });
    }

    return createManagementListFetcher<ClinicManager>({
      fetchList: (body, token) =>
        getClinicManagersApi(
          {
            ...body,
            filters: {
              ...body.filters,
              scopeClinicId: parentClinicId,
            },
          },
          token,
        ),
      accessToken,
      pageSize: PAGINATED_ASYNC_DEFAULT_PAGE_SIZE,
      mapOption: (manager) => ({
        value: manager.id,
        label: `${manager.fullName || `${manager.firstName} ${manager.lastName}`} (${manager.email})`,
        searchText: `${manager.fullName ?? ""} ${manager.email ?? ""}`,
      }),
    });
  }, [accessToken, parentClinicId]);
}
