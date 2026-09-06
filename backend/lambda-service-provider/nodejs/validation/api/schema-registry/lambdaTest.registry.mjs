import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import {
  LambdaTestValidate,
  LambdaTestRouteAccess,
  LambdaTestGrants,
} from "../schemas/lambdaTest.mjs";

export const LAMBDA_TEST_SCHEMAS = {
  [CRUD_ACTIONS.LAMBDA_TEST.VALIDATE]: LambdaTestValidate,
  [CRUD_ACTIONS.LAMBDA_TEST.ROUTE_ACCESS]: LambdaTestRouteAccess,
  [CRUD_ACTIONS.LAMBDA_TEST.GRANTS]: LambdaTestGrants,
};
