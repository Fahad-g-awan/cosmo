export const encodeToken = (token) => {
  if (!token) return null;
  return Buffer.from(JSON.stringify(token)).toString("base64");
};

export const decodeToken = (tokenString) => {
  if (!tokenString) return null;
  return JSON.parse(Buffer.from(tokenString, "base64").toString("utf8"));
};
