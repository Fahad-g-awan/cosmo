import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createCategory,
  deleteCategory,
  getCategoryByIdHandler,
  listCategories,
  updateCategory,
} from "../services/treatment-category.service.mjs";

export const createCategoryHandler = async () => {
  try {
    return await createCategory(getRequestContext());
  } catch (error) {
    console.error("[treatments] create category", error);
    rethrowOrInternal(error);
  }
};

export const getCategory = async () => {
  try {
    return await getCategoryByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[treatments] get category", error);
    rethrowOrInternal(error);
  }
};

export const getCategories = async () => {
  try {
    return await listCategories(getRequestContext());
  } catch (error) {
    console.error("[treatments] list categories", error);
    rethrowOrInternal(error);
  }
};

export const updateCategoryHandler = async () => {
  try {
    return await updateCategory(getRequestContext());
  } catch (error) {
    console.error("[treatments] update category", error);
    rethrowOrInternal(error);
  }
};

export const deleteCategoryHandler = async () => {
  try {
    return await deleteCategory(getRequestContext());
  } catch (error) {
    console.error("[treatments] delete category", error);
    rethrowOrInternal(error);
  }
};

// Route map expects these names
export { createCategoryHandler as createCategory };
export { updateCategoryHandler as updateCategory };
export { deleteCategoryHandler as deleteCategory };
