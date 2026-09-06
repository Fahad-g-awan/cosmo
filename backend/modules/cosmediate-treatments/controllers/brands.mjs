import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createBrands,
  deleteBrand,
  getBrandByIdHandler,
  listBrands,
  updateBrand,
} from "../services/treatment-brand.service.mjs";

export const createBrandsHandler = async () => {
  try {
    return await createBrands(getRequestContext());
  } catch (error) {
    console.error("[treatments] create brands", error);
    rethrowOrInternal(error);
  }
};

export const getBrand = async () => {
  try {
    return await getBrandByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[treatments] get brand", error);
    rethrowOrInternal(error);
  }
};

export const getBrands = async () => {
  try {
    return await listBrands(getRequestContext());
  } catch (error) {
    console.error("[treatments] list brands", error);
    rethrowOrInternal(error);
  }
};

export const updateBrandHandler = async () => {
  try {
    return await updateBrand(getRequestContext());
  } catch (error) {
    console.error("[treatments] update brand", error);
    rethrowOrInternal(error);
  }
};

export const deleteBrandHandler = async () => {
  try {
    return await deleteBrand(getRequestContext());
  } catch (error) {
    console.error("[treatments] delete brand", error);
    rethrowOrInternal(error);
  }
};

export { createBrandsHandler as createBrands };
export { updateBrandHandler as updateBrand };
export { deleteBrandHandler as deleteBrand };
