export interface BlogMessages {
  moreArticles: string;
  viewAll: string;
  topViewed: string;
  publishedAt: (date: string) => string;
  postNotFound: string;
  contentLoadError: string;
  imageAlt: string;
  dateFallback: string;
}
