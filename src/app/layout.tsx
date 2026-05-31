import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import RouteChrome from "@/components/RouteChrome";

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
  title: "Carman Creative — Creative Direction, Accelerated by AI",
  description:
    "John Carman. Creative Director and AI Strategist with 20 years building brands, design systems, and product experiences. Studio in Virginia Beach, Philadelphia, and Brooklyn.",
  metadataBase: new URL("https://www.carmancreative.com"),
  applicationName: "Carman Creative",
  authors: [{ name: "John Carman", url: "https://www.carmancreative.com" }],
  creator: "John Carman",
  publisher: "Carman Creative",
  openGraph: {
    title: "Carman Creative — Creative Direction, Accelerated by AI",
    description:
      "John Carman. Creative Director and AI Strategist. Brands, design systems, and product made with conviction.",
    url: "https://www.carmancreative.com",
    siteName: "Carman Creative",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carman Creative — Creative Direction, Accelerated by AI",
    description:
      "John Carman. Creative Director and AI Strategist. Brands, design systems, and product made with conviction.",
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
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <CustomCursor />
        <RouteChrome />
        {children}
      </body>
    </html>
  );
}
