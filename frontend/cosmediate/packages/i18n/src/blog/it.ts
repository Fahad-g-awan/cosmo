import type { BlogMessages } from "./types";

export const itBlog: BlogMessages = {
  moreArticles: "Altri articoli",
  viewAll: "Visualizza tutto",
  topViewed: "Blog più visitati",
  publishedAt: (date) => `Pubblicato il ${date}`,
  postNotFound: "Articolo del blog non trovato",
  contentLoadError:
    "Impossibile caricare il contenuto del blog, riprova più tardi!",
  imageAlt: "Immagine del blog",
  dateFallback: "Data",
};
