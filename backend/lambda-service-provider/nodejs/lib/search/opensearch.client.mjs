import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Client } from "@opensearch-project/opensearch";

import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

const clientByKey = new Map();

export const getOpenSearchForNode = (endpoint, region) => {
  if (!endpoint)
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Missing required config: OpenSearch endpoint"],
    });
  if (!region)
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      details: ["Missing required config: OpenSearch AWS region"],
    });

  const key = `${endpoint}|${region}`;
  const existing = clientByKey.get(key);
  if (existing) return existing;

  const client = new Client({
    ...AwsSigv4Signer({
      region,
      service: "es",
      getCredentials: () => defaultProvider()(),
    }),
    node: endpoint,
    requestTimeout: 15000,
    maxRetries: 1,
    sniffOnStart: false,
  });

  clientByKey.set(key, client);
  return client;
};

export const getOpenSearchClient = (config) =>
  getOpenSearchForNode(config.OPENSEARCH_ENDPOINT, config.AWS_REGION);
