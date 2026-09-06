import { Montserrat, Raleway } from "next/font/google";
import type { Metadata } from "next";

import "@cosmediate/ui/globals.css";
import "@cosmediate/ui/tiptap.css";
import "@cosmediate/ui/tabs.css";

import { buildRootMetadata, resolveSiteContext } from "@cosmediate/seo";
import { DefaultToaster } from "@cosmediate/ui/components/sonner";
import { I18nRoot } from "@cosmediate/i18n";

import { Providers } from "@app/context/providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await resolveSiteContext("app");
  return buildRootMetadata(ctx);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${raleway.variable} antialiased overflow-hidden font-montserrat`}
      >
        <I18nRoot locale="en">
          <Providers>
            {children}
            <DefaultToaster />
          </Providers>
        </I18nRoot>
      </body>
    </html>
  );
}
