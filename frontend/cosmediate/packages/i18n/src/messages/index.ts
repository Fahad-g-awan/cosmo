import type { MessageLocale, SeoMessages, UiMessages } from "../types";
import { deSeoMessages } from "./de";
import { elSeoMessages } from "./el";
import { enSeoMessages } from "./en";
import { frSeoMessages } from "./fr";
import { itSeoMessages } from "./it";
import { nlSeoMessages } from "./nl";
import { deUiMessages } from "./de";
import { elUiMessages } from "./el";
import { enUiMessages } from "./en";
import { frUiMessages } from "./fr";
import { itUiMessages } from "./it";
import { nlUiMessages } from "./nl";

const UI_MESSAGE_CATALOG: Record<MessageLocale, UiMessages> = {
  en: enUiMessages,
  nl: nlUiMessages,
  de: deUiMessages,
  fr: frUiMessages,
  it: itUiMessages,
  el: elUiMessages,
};

const SEO_MESSAGE_CATALOG: Record<MessageLocale, SeoMessages> = {
  en: enSeoMessages,
  nl: nlSeoMessages,
  de: deSeoMessages,
  fr: frSeoMessages,
  it: itSeoMessages,
  el: elSeoMessages,
};

export function getUiMessages(locale: MessageLocale): UiMessages {
  return UI_MESSAGE_CATALOG[locale];
}

export function getSeoMessages(locale: MessageLocale): SeoMessages {
  return SEO_MESSAGE_CATALOG[locale];
}
