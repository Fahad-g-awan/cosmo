import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createBlogCategories,
  deleteBlogCategory,
  getBlogCategoryByIdHandler,
  listBlogCategories,
  updateBlogCategory,
} from "../services/blog-category.service.mjs";

export const createCategoryHandler = async () => {
  try {
    return await createBlogCategories(getRequestContext());
  } catch (error) {
    console.error("[blogs] category create", error);
    rethrowOrInternal(error);
  }
};

export const getCategory = async () => {
  try {
    return await getBlogCategoryByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[blogs] category get", error);
    rethrowOrInternal(error);
  }
};

export const getCategories = async () => {
  try {
    return await listBlogCategories(getRequestContext());
  } catch (error) {
    console.error("[blogs] category list", error);
    rethrowOrInternal(error);
  }
};

export const updateCategoryHandler = async () => {
  try {
    return await updateBlogCategory(getRequestContext());
  } catch (error) {
    console.error("[blogs] category update", error);
    rethrowOrInternal(error);
  }
};

export const deleteCategoryHandler = async () => {
  try {
    return await deleteBlogCategory(getRequestContext());
  } catch (error) {
    console.error("[blogs] category delete", error);
    rethrowOrInternal(error);
  }
};
