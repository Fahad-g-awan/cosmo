import { uploadFile } from "../s3/upload-file.mjs";

export const createApiUploadHandler =
  ({ env, bucket, region }) =>
  ({ fileBuffer, fieldname, filename, mimeType }) =>
    uploadFile({
      fileBuffer,
      fieldname,
      filename,
      mimeType,
      env,
      bucket,
      region,
    });
