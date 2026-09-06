import { SSMClient } from "@aws-sdk/client-ssm";

const region = process.env.AWS_REGION || "eu-central-1";

export const ssmClient = new SSMClient({ region });
