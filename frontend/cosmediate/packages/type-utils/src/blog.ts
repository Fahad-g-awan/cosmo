import { EntityMetadata, JSONContentType } from "./shared";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "HIDDEN";

export interface BlogCategory extends EntityMetadata {
  name: string;
  published: boolean;
  blogCount?: number;
}

export interface Blog extends EntityMetadata {
  title: string;
  overview?: string;
  image?: string;
  content: JSONContentType;
  status: BlogStatus;
  publishedAt: string;
  tags: string[];
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  searchClicks?: number;
}
