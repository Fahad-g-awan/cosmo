import api from "../axiosInstance";
import { handleApiError, logApiResponse } from "../lib/utils";
import type { ImageUploadResponse } from "../types/image.types";

export const imageUploadApi = async (
  formData: FormData
): Promise<ImageUploadResponse> => {
  try {
    const response = await api.post<ImageUploadResponse>(
      "/image-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return logApiResponse("/image-upload", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};
