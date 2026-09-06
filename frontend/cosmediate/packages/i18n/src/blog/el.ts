import type { BlogMessages } from "./types";

export const elBlog: BlogMessages = {
  moreArticles: "Περισσότερα άρθρα",
  viewAll: "Δείτε όλα",
  topViewed: "Δημοφιλή blogs",
  publishedAt: (date) => `Δημοσιεύτηκε στις ${date}`,
  postNotFound: "Η δημοσίευση του blog δεν βρέθηκε",
  contentLoadError:
    "Δεν ήταν δυνατή η φόρτωση του περιεχομένου του blog, δοκιμάστε ξανά αργότερα!",
  imageAlt: "Εικόνα blog",
  dateFallback: "Ημερομηνία",
};
