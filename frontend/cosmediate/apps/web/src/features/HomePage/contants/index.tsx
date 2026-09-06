import { FaCalendarCheck, FaSearch, FaThumbsUp } from "react-icons/fa";

export const HERO_ITEM_ICONS = [
  { id: 1, icon: "/home/hero/compare.svg" },
  { id: 2, icon: "/home/hero/find.svg" },
  { id: 3, icon: "/home/hero/book.svg" },
] as const;

export const SERVICE_ICONS = [
  { id: 1, icon: FaSearch, src: "/home/services/search.svg" },
  { id: 2, icon: FaThumbsUp, src: "/home/services/like.svg" },
  { id: 3, icon: FaCalendarCheck, src: "/home/services/book.svg" },
] as const;

export const FEATURE_ITEMS = [
  {
    id: "treatments",
    image: "/home/services/treatment.png",
    url: "/treatments",
  },
  {
    id: "clinics",
    image: "/home/services/femalediagnosing.png",
    url: "/clinics",
  },
  {
    id: "blog",
    image: "/home/services/skintest.png",
    url: "/blog",
  },
] as const;
