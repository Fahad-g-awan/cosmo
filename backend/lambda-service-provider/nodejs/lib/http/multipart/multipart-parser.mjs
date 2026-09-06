import Busboy from "busboy";

import {
  isJsonContentType,
  isMultipartContentType,
} from "../_utils/headers.utils.mjs";
import {
  assignFieldValue,
  collectFileStream,
} from "../_utils/multipart.utils.mjs";

/**
 * Parses the multipart/form-data body and returns a promise that resolves to the result.
 *
 * @param {object} body - The body to parse.
 * @param {string} contentType - The content type.
 * @param {object} fileLimits - The file limits.
 * @param {function} onFileUpload - The function to upload the file.
 * @returns {Promise<object>} The result.
 */
export const parseMultipartFormData = ({
  body,
  contentType,
  fileLimits,
  onFileUpload,
}) => {
  console.log("parseMultipartFormData");

  return new Promise((resolve, reject) => {
    if (!contentType) return resolve({});
    if (isJsonContentType(contentType)) return resolve({});
    if (!isMultipartContentType(contentType)) return resolve({});

    const bb = Busboy({
      headers: {
        "content-type": contentType,
        "content-length": String(body.byteLength),
      },
    });
    console.log("Busboy created");

    const result = {};
    const uploads = [];

    bb.on("field", (fieldname, val) => {
      console.log("field", fieldname);
      result[fieldname] = val;
    });

    bb.on("file", (fieldname, file, info) => {
      console.log("file", fieldname);

      if (!onFileUpload) {
        file.resume();
        return reject(new Error("File upload handler is not configured"));
      }

      const { filename, mimeType, mimetype } = info;
      const resolvedMimeType = mimeType || mimetype;

      // Validate MIME type
      if (!fileLimits.allowedMimeTypes.includes(resolvedMimeType)) {
        file.resume();
        return reject(
          new Error(
            `Invalid file type: ${resolvedMimeType}, should be one of ${fileLimits.allowedMimeTypes.join(
              ", ",
            )}`,
          ),
        );
      }

      const put = collectFileStream(file, fileLimits)
        .then((fileBuffer) => {
          console.log("file end", fieldname);

          return onFileUpload({
            fileBuffer,
            fieldname,
            filename,
            mimeType: resolvedMimeType,
          });
        })
        .then((url) => {
          assignFieldValue(result, fieldname, url);
        });

      uploads.push(put);
    });

    bb.on("error", reject);

    bb.on("finish", async () => {
      try {
        if (uploads.length) await Promise.all(uploads);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });

    // Feed the raw Buffer to Busboy
    bb.end(body);
  });
};
