import type {
  GetBlogRequest,
  GetBlogResponse,
  GetBlogsRequest,
  GetBlogsResponse,
} from "../../types/blog.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementBlogApi = async (
  params: GetBlogRequest,
  token: string,
): Promise<GetBlogResponse> => {
  try {
    const response = await api.get<GetBlogResponse>(
      `/management/blogs?id=${params.id}&from=${params?.from || "listing"}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/blogs [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementBlogsApi = async (
  data: GetBlogsRequest,
  token: string,
): Promise<GetBlogsResponse> => {
  try {
    const response = await api.post<GetBlogsResponse>(
      `/management/blogs/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/blogs/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
