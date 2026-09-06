import type { BlogMessages } from "./types";

export const nlBlog: BlogMessages = {
  moreArticles: "Meer artikelen",
  viewAll: "Alles bekijken",
  topViewed: "Meest bekeken blogs",
  publishedAt: (date) => `Gepubliceerd op ${date}`,
  postNotFound: "Blogbericht niet gevonden",
  contentLoadError:
    "Bloginhoud kon niet worden geladen, probeer het later opnieuw!",
  imageAlt: "Blogafbeelding",
  dateFallback: "Datum",
};
