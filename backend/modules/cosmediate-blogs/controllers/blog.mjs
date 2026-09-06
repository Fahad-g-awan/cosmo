import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";
import { rethrowOrInternal } from "/opt/nodejs/lib/errors/http-error.mjs";

import {
  createBlog,
  deleteBlog,
  getBlogByIdHandler,
  getRelatedBlogs,
  getTopSearchedBlogs,
  listBlogs,
  updateBlog,
} from "../services/blog.service.mjs";

export const createBlogHandler = async () => {
  try {
    return await createBlog(getRequestContext());
  } catch (error) {
    console.error("[blogs] create", error);
    rethrowOrInternal(error);
  }
};

export const getBlog = async () => {
  try {
    return await getBlogByIdHandler(getRequestContext());
  } catch (error) {
    console.error("[blogs] get", error);
    rethrowOrInternal(error);
  }
};

export const getBlogs = async () => {
  try {
    return await listBlogs(getRequestContext());
  } catch (error) {
    console.error("[blogs] list", error);
    rethrowOrInternal(error);
  }
};

export const updateBlogHandler = async () => {
  try {
    return await updateBlog(getRequestContext());
  } catch (error) {
    console.error("[blogs] update", error);
    rethrowOrInternal(error);
  }
};

export const deleteBlogHandler = async () => {
  try {
    return await deleteBlog(getRequestContext());
  } catch (error) {
    console.error("[blogs] delete", error);
    rethrowOrInternal(error);
  }
};

export const getRelatedBlog = async () => {
  try {
    return await getRelatedBlogs(getRequestContext());
  } catch (error) {
    console.error("[blogs] related", error);
    rethrowOrInternal(error);
  }
};

export const getTopSearchedBlogsHandler = async () => {
  try {
    return await getTopSearchedBlogs(getRequestContext());
  } catch (error) {
    console.error("[blogs] top-searched", error);
    rethrowOrInternal(error);
  }
};
