import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DateTime } from "luxon";

import { generateApiUploadKey } from "../upload/resolve-upload-key.mjs";

/**
 * Uploads the file to the S3 bucket.
 *
 * @param {object} fileBuffer - The file buffer.
 * @param {string} fieldname - The field name.
 * @param {string} filename - The file name.
 * @param {string} mimeType - The MIME type.
 * @param {string} env - The environment.
 * @param {string} bucket - The S3 bucket.
 * @param {string} region - The S3 region.
 * @returns {Promise<string>} The uploaded file URL.
 */
export const uploadFile = async ({
  fileBuffer,
  fieldname,
  filename,
  mimeType,
  env,
  bucket,
  region,
}) => {
  const s3Region = process.env.AWS_REGION || region || "eu-central-1";
  const s3Client = new S3Client({
    region: s3Region,
    forcePathStyle: false,
  });

  const safeName = (filename || "unnamed").replace(/[^\w.\-]+/g, "_");
  const timestamp = DateTime.now()
    .toISO()
    .replace(/[:+]/g, "-")
    .replace(/\./g, "-");
  const keyPostfix = `${timestamp}-${safeName}`;
  const key = generateApiUploadKey(fieldname, keyPostfix, env);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType || "application/octet-stream",
  });

  await s3Client.send(command);

  return `https://${bucket}.s3.${s3Region}.amazonaws.com/${key}`;
};
