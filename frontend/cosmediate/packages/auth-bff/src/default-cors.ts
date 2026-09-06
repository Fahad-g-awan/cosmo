import { generateAllowedOrigins } from "@cosmediate/config";

import { createCorsHelpers } from "./cors";

const { optionsHandler, requestHeader } = createCorsHelpers(
  generateAllowedOrigins(),
);

export { optionsHandler, requestHeader };
