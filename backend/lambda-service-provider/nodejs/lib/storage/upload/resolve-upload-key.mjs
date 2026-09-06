import { UPLOAD_FIELD_MAP, UPLOAD_PATH_MAP } from "../../../validation/api/upload/index.mjs";

export const normalizeUploadFieldName = (fieldname) => {
  const arrayMatch = fieldname.match(/^([^\[\]]+)\[\d+\]$/);
  return arrayMatch ? arrayMatch[1] : fieldname;
};

export const resolveUploadType = (fieldname) => {
  const normalizedField = normalizeUploadFieldName(fieldname);
  return UPLOAD_FIELD_MAP[normalizedField] ?? "misc.image";
};

export const resolveUploadPathPrefix = (uploadType) =>
  UPLOAD_PATH_MAP[uploadType] ?? UPLOAD_PATH_MAP["misc.image"];

export const generateApiUploadKey = (fieldname, keyPostfix, env) => {
  const uploadType = resolveUploadType(fieldname);
  const prefix = resolveUploadPathPrefix(uploadType);

  let key = `${prefix}/${keyPostfix}`;

  if (env) {
    key = `${env}/${key}`;
  }

  return key;
};
