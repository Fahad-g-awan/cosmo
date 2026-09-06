import {
  isJsonContentType,
  isMultipartContentType,
  normalizeHeaders,
} from "./_utils/headers.utils.mjs";
import { createApiUploadHandler } from "../storage/upload/api-upload.handler.mjs";
import { parseMultipartFormData } from "./multipart/multipart-parser.mjs";
import { decodeBodyBuffer, parseJsonBody } from "./_utils/body.utils.mjs";
import { API_FILE_UPLOAD_LIMITS } from "../../config/upload.mjs";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

export const parseBody = async (event, env, config) => {
  // 1) Normalize headers (case-insensitive)
  const headers = normalizeHeaders(event.headers);

  const contentType = headers["content-type"] || "";
  const isJson = isJsonContentType(contentType);
  const isMultipart = isMultipartContentType(contentType);

  console.log("isMultipart", isMultipart);
  console.log("isJson", isJson);

  // 2) Parse based on content type

  let parsed;

  // Empty body
  if (!event.body) {
    parsed = null;
  }

  // Parse JSON body
  else if (isJson) {
    try {
      parsed = parseJsonBody(event.body, event.isBase64Encoded);
    } catch {
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        message: "Invalid JSON body",
        details: ["Invalid JSON body"],
      });
    }
  }

  // Parse multipart/form-data body
  else if (isMultipart) {
    try {
      const bodyBuffer = decodeBodyBuffer(event.body, event.isBase64Encoded);

      parsed = await parseMultipartFormData({
        body: bodyBuffer,
        contentType,
        fileLimits: API_FILE_UPLOAD_LIMITS,
        onFileUpload: createApiUploadHandler({
          env,
          bucket: config.S3_BUCKET,
          region: config.AWS_REGION,
        }),
      });
    } catch (error) {
      console.log("Error at parseBody", error);
      throw httpError({
        error: API_ERRORS.BAD_REQUEST,
        message: "Invalid Request Data",
        details: [error?.message ?? ""],
      });
    }
  }

  console.log("parsed", parsed);
  return parsed;
};
