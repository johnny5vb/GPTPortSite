import type { Metadata, Viewport } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import RouteChrome from "@/components/RouteChrome";
import SmoothScroll from "@/components/SmoothScroll";
import { ViewTransitions } from "next-view-transitions";

// One serif family for display *and* body. Its optical-size axis does the
// work Fraunces' SOFT/WONK axes used to — tight and dramatic at 60pt, open
// and readable at 14pt — so there is no pairing left to get wrong.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "John Carman — Carman Creative | Brand & Creative Direction",
    template: "%s",
  },
  description:
    "Creative direction, brand systems, and creative operations. Twenty years across enterprise brand, campaigns, and design systems, most of it inside large healthcare organizations.",
  metadataBase: new URL("https://www.carmancreative.com"),
  applicationName: "Carman Creative",
  authors: [{ name: "John Carman", url: "https://www.carmancreative.com" }],
  creator: "John Carman",
  publisher: "Carman Creative",
  alternates: { canonical: "/" },
  openGraph: {
    title: "John Carman — Carman Creative | Brand & Creative Direction",
    description:
      "Creative direction, brand systems, and creative operations. Twenty years across enterprise brand, campaigns, and design systems, most of it inside large healthcare organizations.",
    url: "https://www.carmancreative.com",
    siteName: "Carman Creative",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "John Carman — Carman Creative | Brand & Creative Direction",
    description:
      "Creative direction, brand systems, and creative operations. Twenty years across enterprise brand, campaigns, and design systems, most of it inside large healthcare organizations.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b09",
};

/** Person structured data for search. Descriptive, no availability signal. */
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "John Carman",
  jobTitle: "Creative Director",
  description:
    "Creative director and brand & creative-operations leader. Twenty years across brand, creative direction, creative operations, and design systems, most of it inside large healthcare organizations.",
  knowsAbout: [
    "Creative direction",
    "Brand strategy and identity systems",
    "Creative operations",
    "Design systems",
    "Integrated campaigns",
    "Team leadership",
    "AI-enabled creative workflow",
  ],
  url: "https://www.carmancreative.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Virginia Beach",
    addressRegion: "VA",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.linkedin.com/in/johncarman/",
    "https://www.instagram.com/jbcarms",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${jetbrains.variable}`}
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
        {/* Person JSON-LD. Rendered last so React 19 script handling can't
            shift the interactive chrome above during hydration. Static data. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </body>
    </html>
  );
}
