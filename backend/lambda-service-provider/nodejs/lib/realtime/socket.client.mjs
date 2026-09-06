import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";
import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

const clientByEnv = new Map();

export const getSocketApiClientByEnv = (env, socketApiUrl) => {
  if (!env || !socketApiUrl)
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: [
        "Missing required config: Socket API environment",
        "Missing required config: Socket API URL",
      ],
    });

  const key = `socketApi-${env}`;
  const existing = clientByEnv.get(key);
  if (existing) return existing;

  const socketApi = new ApiGatewayManagementApiClient({
    endpoint: socketApiUrl,
    region: "eu-central-1",
  });

  clientByEnv.set(key, socketApi);
  return socketApi;
};

export const getSocketApiClient = (config) => {
  return getSocketApiClientByEnv(config.ENV, config.SOCKET_API);
};
