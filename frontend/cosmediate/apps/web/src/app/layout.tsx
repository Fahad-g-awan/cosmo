import { Montserrat } from "next/font/google";
import type { Metadata } from "next";

import "@cosmediate/ui/globals.css";
import "@cosmediate/ui/tiptap.css";
import "@cosmediate/ui/tabs.css";

import { buildRootMetadata, resolveSiteContext } from "@cosmediate/seo";
import { DefaultToaster } from "@cosmediate/ui/components/sonner";
import { Providers } from "@web/context/providers";
import { I18nRoot } from "@cosmediate/i18n";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("web");
  return buildRootMetadata(ctx);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await resolveSiteContext("web");

  return (
    <html lang={ctx.htmlLang}>
      <body className={`${montserrat.variable} antialiased font-montserrat`}>
        <I18nRoot locale={ctx.messageLocale}>
          <Providers>
            {children}
            <DefaultToaster />
          </Providers>
        </I18nRoot>
      </body>
    </html>
  );
}
