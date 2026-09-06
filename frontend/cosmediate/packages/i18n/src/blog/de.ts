import type { BlogMessages } from "./types";

export const deBlog: BlogMessages = {
  moreArticles: "Weitere Artikel",
  viewAll: "Alle anzeigen",
  topViewed: "Meistgesehene Blogs",
  publishedAt: (date) => `Veröffentlicht am ${date}`,
  postNotFound: "Blogbeitrag nicht gefunden",
  contentLoadError:
    "Blog-Inhalt konnte nicht geladen werden, bitte versuchen Sie es später erneut!",
  imageAlt: "Blog-Bild",
  dateFallback: "Datum",
};
