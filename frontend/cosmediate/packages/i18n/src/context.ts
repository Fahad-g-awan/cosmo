import type { MessageLocale, SeoMessages, UiMessages } from "./types";
import { getSeoMessages, getUiMessages } from "./messages";

export interface LocaleContext {
  messageLocale: MessageLocale;
}

export function getUiMessagesForContext(ctx: LocaleContext): UiMessages {
  return getUiMessages(ctx.messageLocale);
}

export function getSeoMessagesForContext(ctx: LocaleContext): SeoMessages {
  return getSeoMessages(ctx.messageLocale);
}
