import { API_ERRORS } from "../../../constants/errors/index.mjs";
import { httpError } from "../../errors/http-error.mjs";
import { SQSClient } from "@aws-sdk/client-sqs";

const clientByEnv = new Map();

export const getSqsClientByEnv = (env) => {
  if (!env)
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Missing required config: SQS environment"],
    });

  const key = `sqs-${env}`;
  const existing = clientByEnv.get(key);
  if (existing) return existing;

  const sqs = new SQSClient({});

  clientByEnv.set(key, sqs);
  return sqs;
};

export const getSqsClient = (config) => {
  return getSqsClientByEnv(config.ENV);
};
