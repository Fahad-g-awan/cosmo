import { useImperativeHandle, type Ref } from "react";

import type { FormStore } from "@cosmediate/form-core";

import {
  applyApiFailureToForm,
  type ApiFailureLike,
  type FormApiRef,
} from "./api-errors";

export type { FormApiRef };

export function useFormApiHandle<T extends Record<string, unknown>>(
  store: FormStore<T>,
  ref: Ref<FormApiRef | null>,
) {
  useImperativeHandle(
    ref,
    () => ({
      setApiErrors: (response: ApiFailureLike, fieldMap?: Record<string, string>) =>
        applyApiFailureToForm(store.getState().setErrors, response, fieldMap),
    }),
    [store],
  );
}
