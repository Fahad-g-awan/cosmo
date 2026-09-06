export type {
  CommonMessages,
  BrowseMessages,
  ProfileMessages,
  BlogMessages,
  AuthMessages,
  AuthProcessingErrorCode,
  FormMessages,
  FormValidationMessages,
  FooterMessages,
  HeaderMessages,
  ListingPageMessages,
  MarketingPageMessages,
  MarketingMessages,
  MessageLocale,
  NavMessages,
  SeoMessageLocale,
  SeoMessages,
  UiMessages,
  UiNamespace,
} from "./types";
export { MESSAGE_LOCALES } from "./types";

export * from "./locales";
export { getSeoMessages, getUiMessages } from "./messages";
export {
  getSeoMessagesForContext,
  getUiMessagesForContext,
  type LocaleContext,
} from "./context";

export { I18nRoot } from "./components/I18nRoot";
export { buildFooterLinks, type FooterLinkItem, type FooterLinks } from "./chrome/en";
export {
  CHROME_PATHS,
  HEADER_NAV_ITEMS,
  type HeaderNavKey,
} from "./paths";
