import { Montserrat } from "next/font/google";
import type { Metadata } from "next";

import "@cosmediate/ui/globals.css";
import "@cosmediate/ui/tiptap.css";
import "@cosmediate/ui/tabs.css";

import { buildRootMetadata, resolveSiteContext } from "@cosmediate/seo";
import { DefaultToaster } from "@cosmediate/ui/components/sonner";
import { resolveAuthLocale } from "@cosmediate/i18n/server";
import { Providers } from "@auth/context/providers";
import { I18nRoot } from "@cosmediate/i18n";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("auth");
  return buildRootMetadata(ctx);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveAuthLocale();

  return (
    <html lang={locale}>
      <body className={`${montserrat.variable} antialiased font-montserrat`}>
        <I18nRoot locale={locale}>
          <Providers>
            {children}
            <DefaultToaster />
          </Providers>
        </I18nRoot>
      </body>
    </html>
  );
}
