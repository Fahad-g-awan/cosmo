import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

const region = process.env.AWS_REGION || "eu-central-1";

export const secretsManagerClient = new SecretsManagerClient({ region });
