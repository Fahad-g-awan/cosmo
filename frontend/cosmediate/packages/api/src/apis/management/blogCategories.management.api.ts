import type {
  GetBlogCategoryRequest,
  GetBlogCategoryResponse,
  GetBlogCategoriesRequest,
  GetBlogCategoriesResponse,
} from "../../types/blogCategory.types";
import { handleApiError, logApiResponse } from "../../lib/utils";
import api from "../../axiosInstance";

export const getManagementBlogCategoryApi = async (
  params: GetBlogCategoryRequest,
  token: string,
): Promise<GetBlogCategoryResponse> => {
  try {
    const response = await api.get<GetBlogCategoryResponse>(
      `/management/blogs/categories?id=${params.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(`/management/blogs/categories [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getManagementBlogCategoriesApi = async (
  data: GetBlogCategoriesRequest,
  token: string,
): Promise<GetBlogCategoriesResponse> => {
  try {
    const response = await api.post<GetBlogCategoriesResponse>(
      `/management/blogs/categories/list`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return logApiResponse(
      `/management/blogs/categories/list [POST]`,
      response.data,
    );
  } catch (error) {
    return handleApiError(error);
  }
};
