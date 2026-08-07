import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import RouteChrome from "@/components/RouteChrome";
import SmoothScroll from "@/components/SmoothScroll";
import { ViewTransitions } from "next-view-transitions";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

/**
 * Sitewide metadata defaults. Every route inherits these and overrides the
 * bits that are page-specific — see `src/lib/seo.ts` for the shared helper.
 *
 * Deliberately no `alternates.canonical` here: a canonical set on the root
 * layout cascades to every child, so each page declares its own.
 */
export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: "John Carman", url: SITE_URL }],
  creator: "John Carman",
  publisher: SITE_NAME,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jetbrains.variable} ${geist.variable}`}
    >
      <body className="noise-fixed antialiased">
        <ViewTransitions>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <SmoothScroll />
          <CustomCursor />
          <RouteChrome />
          {children}
        </ViewTransitions>
      </body>
    </html>
  );
}
