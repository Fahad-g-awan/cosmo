import { CRUD_ACTIONS } from "../../../constants/api/crud-actions/index.mjs";
import { BlogCreate, BlogUpdate, BlogDelete, BlogList } from "../schemas/blog/blog.mjs";
import {
  BlogCategoryCreate,
  BlogCategoryUpdate,
  BlogCategoryDelete,
  BlogCategoryList,
} from "../schemas/blog/blogCategory.mjs";

export const BLOG_SCHEMAS = {
  [CRUD_ACTIONS.BLOG.CREATE]: BlogCreate,
  [CRUD_ACTIONS.BLOG.UPDATE]: BlogUpdate,
  [CRUD_ACTIONS.BLOG.DELETE]: BlogDelete,
  [CRUD_ACTIONS.BLOG.LIST]: BlogList,

  [CRUD_ACTIONS.BLOG_CATEGORY.CREATE]: BlogCategoryCreate,
  [CRUD_ACTIONS.BLOG_CATEGORY.UPDATE]: BlogCategoryUpdate,
  [CRUD_ACTIONS.BLOG_CATEGORY.DELETE]: BlogCategoryDelete,
  [CRUD_ACTIONS.BLOG_CATEGORY.LIST]: BlogCategoryList,
};
