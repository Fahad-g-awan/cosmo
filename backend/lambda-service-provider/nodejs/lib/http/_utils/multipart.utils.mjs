/**
 * Extracts the field name and index from the fieldname.
 * If the fieldname is an array, it assigns the value to the array index.
 * Otherwise it assigns the value to the field name.
 *
 * @param {object} result - The result object.
 * @param {string} fieldname - The field name.
 * @param {string} value - The uploaded file url.
 */
export const assignFieldValue = (result, fieldname, value) => {
  const arrayMatch = fieldname.match(/^([^\[\]]+)\[(\d+)\]$/);

  if (arrayMatch) {
    const baseName = arrayMatch[1];
    const idx = parseInt(arrayMatch[2], 10);

    if (!Array.isArray(result[baseName])) {
      result[baseName] = [];
    }

    result[baseName][idx] = value;
    return;
  }

  result[fieldname] = value;
};

/**
 * Collects the file stream and returns a promise that resolves to the file buffer
 * if the file size is less than the file limits.
 *
 * @param {object} file - The file stream.
 * @param {object} fileLimits - The file limits.
 * @returns {Promise<Buffer>} The file buffer.
 */
export const collectFileStream = (file, fileLimits) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    file.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > fileLimits.maxSize) {
        file.resume();
        return reject(
          new Error(
            `File too large, should be less than ${
              fileLimits.maxSize / 1024 / 1024
            }MB`,
          ),
        );
      }

      chunks.push(chunk);
    });

    file.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
  });
