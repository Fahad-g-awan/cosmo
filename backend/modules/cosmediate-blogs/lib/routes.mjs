import { BLOG_ROUTE_DEFS as R } from "/opt/nodejs/config/routes/blog.routes.mjs";

import {
  createBlogHandler,
  deleteBlogHandler,
  getBlog,
  getBlogs,
  getRelatedBlog,
  getTopSearchedBlogsHandler,
  updateBlogHandler,
} from "../controllers/blog.mjs";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategories,
  getCategory,
  updateCategoryHandler,
} from "../controllers/category.mjs";

export const ROUTES = new Map([
  [R.GET_ONE.key, getBlog],
  [R.LIST.key, getBlogs],
  [R.RELATED.key, getRelatedBlog],
  [R.TOP_SEARCHED.key, getTopSearchedBlogsHandler],
  [R.MANAGEMENT_GET_ONE.key, getBlog],
  [R.MANAGEMENT_LIST.key, getBlogs],
  [R.CREATE.key, createBlogHandler],
  [R.UPDATE.key, updateBlogHandler],
  [R.DELETE.key, deleteBlogHandler],
  [R.CATEGORY_GET_ONE.key, getCategory],
  [R.CATEGORY_LIST.key, getCategories],
  [R.MANAGEMENT_CATEGORY_GET_ONE.key, getCategory],
  [R.MANAGEMENT_CATEGORY_LIST.key, getCategories],
  [R.CATEGORY_CREATE.key, createCategoryHandler],
  [R.CATEGORY_UPDATE.key, updateCategoryHandler],
  [R.CATEGORY_DELETE.key, deleteCategoryHandler],
]);
