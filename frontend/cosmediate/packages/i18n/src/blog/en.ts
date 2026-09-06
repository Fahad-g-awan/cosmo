import type { BlogMessages } from "./types";

export const enBlog: BlogMessages = {
  moreArticles: "More Articles",
  viewAll: "View all",
  topViewed: "Top Viewed Blogs",
  publishedAt: (date) => `Published at ${date}`,
  postNotFound: "Blog post not found",
  contentLoadError: "Could not load blog content, please try again later!",
  imageAlt: "Blog image",
  dateFallback: "Date",
};
