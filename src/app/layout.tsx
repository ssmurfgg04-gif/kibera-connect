import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "@fontsource-variable/caveat";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "KiberaConnect | Report it. Follow it. Get it fixed.",
  description:
    "See a broken pipe or a dead streetlight in Kibera? Take one photo. We find everyone else affected, make noise on your behalf, and follow the repair until it is done. Built with Kibera, Nairobi.",
  keywords: [
    "Kibera",
    "Nairobi",
    "community reporting",
    "civic tech",
    "water",
    "sanitation",
    "Hack for Humanity",
  ],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "KiberaConnect | Report it. Follow it. Get it fixed.",
    description:
      "One photo. Everyone affected. Followed until it is fixed. A community proof engine for Kibera, Nairobi.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfaf5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
