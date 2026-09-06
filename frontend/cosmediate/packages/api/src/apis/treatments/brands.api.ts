import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetBrandRequest,
  GetBrandResponse,
  GetBrandsRequest,
  GetBrandsResponse,
  CreateBrandsRequest,
  CreateBrandsResponse,
  UpdateBrandRequest,
  UpdateBrandResponse,
  DeleteBrandRequest,
  DeleteBrandResponse,
} from "../../types/treatment.types";

export const getBrandApi = async (
  params: GetBrandRequest
): Promise<GetBrandResponse> => {
  try {
    const response = await api.get<GetBrandResponse>(
      `/treatments/brands?id=${params.id}`
    );
    return logApiResponse(`/treatments/brand [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBrandsApi = async (
  data: GetBrandsRequest
): Promise<GetBrandsResponse> => {
  try {
    const response = await api.post<GetBrandsResponse>(
      `/treatments/brands/list`,
      data
    );
    return logApiResponse(`/treatments/brands [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createBrandsApi = async (
  data: CreateBrandsRequest,
  accessToken: string
): Promise<CreateBrandsResponse> => {
  try {
    const response = await api.post<CreateBrandsResponse>(
      `/treatments/brands`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/brands [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBrandApi = async (
  data: UpdateBrandRequest,
  accessToken: string
): Promise<UpdateBrandResponse> => {
  try {
    const response = await api.put<UpdateBrandResponse>(
      `/treatments/brands`,
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/brands [PUT]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBrandApi = async (
  params: DeleteBrandRequest,
  accessToken: string
): Promise<DeleteBrandResponse> => {
  try {
    const response = await api.delete<DeleteBrandResponse>(
      `/treatments/brands?id=${params.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return logApiResponse(`/treatments/brands [DELETE]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
