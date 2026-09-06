import { BLOG_STATUS } from "../../../../constants/domain/blog.constants.mjs";
import { openSearchListBody } from "../../shared/opensearch-list.schema.mjs";
import { htmlBlob, tags } from "../../shared/fragments.schema.mjs";
import { String, URI } from "../../shared/primitives.schema.mjs";

const overview = {
  type: "string",
  minLength: 10,
  maxLength: 300,
  pattern: "\\S",
  errorMessage: {
    minLength: "Overview must be at least 10 characters",
    maxLength: "Overview must be at most 300 characters",
    pattern: "Overview is required",
  },
};

const requiredTags = {
  ...tags,
  minItems: 1,
  errorMessage: {
    minItems: "At least one tag is required",
  },
};

const blogTitle = {
  type: "string",
  minLength: 2,
  maxLength: 100,
  pattern: "\\S",
  errorMessage: {
    minLength: "Title must be at least 2 characters",
    maxLength: "Title must be at most 100 characters",
    pattern: "Title is required",
  },
};

const blogStatus = {
  type: "string",
  enum: Object.values(BLOG_STATUS),
  errorMessage: {
    enum: "Status must be one of: DRAFT, PUBLISHED, HIDDEN",
  },
};

export const BlogCreate = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "overview",
    "blogImage",
    "content",
    "status",
    "publishedAt",
    "tags",
    "categoryId",
  ],
  properties: {
    title: blogTitle,
    overview,
    blogImage: URI,
    content: htmlBlob,
    status: blogStatus,
    publishedAt: String,
    tags: requiredTags,
    categoryId: String,
  },
  errorMessage: {
    required: {
      title: "Title is required",
      overview: "Overview is required",
      blogImage: "Blog image is required",
      content: "Content is required",
      status: "Status is required",
      publishedAt: "Publish date is required",
      tags: "At least one tag is required",
      categoryId: "Category is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      title: "Title is invalid",
      overview: "Overview is invalid",
      blogImage: "Blog image is required",
      content: "Content is required",
      status: "Status must be one of: DRAFT, PUBLISHED, HIDDEN",
      publishedAt: "Publish date is required",
      tags: "At least one tag is required",
      categoryId: "Please provide a valid blog category",
    },
  },
};

export const BlogUpdate = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "overview",
    "blogImage",
    "content",
    "status",
    "publishedAt",
    "tags",
    "categoryId",
  ],
  properties: {
    id: String,
    title: blogTitle,
    overview,
    blogImage: URI,
    content: htmlBlob,
    status: blogStatus,
    publishedAt: String,
    tags: requiredTags,
    categoryId: String,
  },
  errorMessage: {
    required: {
      id: "Blog ID is required",
      title: "Title is required",
      overview: "Overview is required",
      blogImage: "Blog image is required",
      content: "Content is required",
      status: "Status is required",
      publishedAt: "Publish date is required",
      tags: "At least one tag is required",
      categoryId: "Category is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Blog ID is required",
      title: "Title is invalid",
      overview: "Overview is invalid",
      blogImage: "Blog image is required",
      content: "Content is required",
      status: "Status must be one of: DRAFT, PUBLISHED, HIDDEN",
      publishedAt: "Publish date is required",
      tags: "At least one tag is required",
      categoryId: "Please provide a valid blog category",
    },
  },
};

export const BlogDelete = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: String,
  },
  errorMessage: {
    required: {
      id: "Blog ID is required",
    },
    additionalProperties: "Unknown field supplied in request body",
    properties: {
      id: "Blog ID is required",
    },
  },
};

export const BlogList = openSearchListBody();
