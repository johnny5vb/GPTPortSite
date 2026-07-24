import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import RouteChrome from "@/components/RouteChrome";
import SmoothScroll from "@/components/SmoothScroll";
import { ViewTransitions } from "next-view-transitions";

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

export const metadata: Metadata = {
  title: {
    default:
      "John Carman | Creative Director, Brand and Creative Operations Leader",
    template: "%s",
  },
  description:
    "Portfolio of Creative Director John Carman — enterprise brand leadership, campaigns, creative operations, digital experiences, and AI-enabled creative systems. Based in Virginia Beach; available for remote and select hybrid roles.",
  metadataBase: new URL("https://www.carmancreative.com"),
  applicationName: "Carman Creative",
  authors: [{ name: "John Carman", url: "https://www.carmancreative.com" }],
  creator: "John Carman",
  publisher: "Carman Creative",
  alternates: { canonical: "/" },
  openGraph: {
    title:
      "John Carman | Creative Director, Brand and Creative Operations Leader",
    description:
      "Enterprise brand leadership, campaigns, creative operations, and AI-enabled creative systems.",
    url: "https://www.carmancreative.com",
    siteName: "Carman Creative",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "John Carman | Creative Director, Brand and Creative Operations Leader",
    description:
      "Enterprise brand leadership, campaigns, creative operations, and AI-enabled creative systems.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
};

/** Person structured data for search — leadership-forward. */
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "John Carman",
  jobTitle: "Creative Director",
  description:
    "Creative Director and Brand & Creative Operations Leader with 20 years across enterprise brand, campaigns, creative operations, and AI-enabled creative systems.",
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
