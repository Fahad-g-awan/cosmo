import type { BlogMessages } from "./types";

export const frBlog: BlogMessages = {
  moreArticles: "Plus d'articles",
  viewAll: "Tout afficher",
  topViewed: "Blogs les plus consultés",
  publishedAt: (date) => `Publié le ${date}`,
  postNotFound: "Article de blog introuvable",
  contentLoadError:
    "Impossible de charger le contenu du blog, veuillez réessayer plus tard !",
  imageAlt: "Image du blog",
  dateFallback: "Date",
};
