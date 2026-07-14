import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "A1 Vision Real Estate — Premium Real Estate | Buy, Sell, Rent & Invest",
  description:
    "A1 Vision Real Estate is a premium real estate agency helping you buy, sell, rent, and invest with confidence. Explore curated property listings, suburb guides, and expert agents.",
  keywords: [
    "real estate",
    "property for sale",
    "buy property",
    "sell property",
    "rent property",
    "property management",
    "suburb guides",
    "A1 Vision Real Estate",
  ],
  authors: [{ name: "A1 Vision Real Estate" }],
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "A1 Vision Real Estate — Premium Real Estate",
    description:
      "Buy, sell, rent and invest with Victoria's most trusted real estate team.",
    siteName: "A1 Vision Real Estate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A1 Vision Real Estate — Premium Real Estate",
    description: "Buy, sell, rent and invest with confidence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Static fetch shim — must load before app code so /api/* calls
            are intercepted and served from /data/*.json (static export mode). */}
        <script src="/fetch-shim.js" defer={false} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
