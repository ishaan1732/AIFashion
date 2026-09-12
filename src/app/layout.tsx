import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Fashion Stylist | Runway to Reality",
  description: "Find clothes from Zara, Calvin Klein, and Boss by budget and style, then try them on with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://static.opentok.com/v2/js/opentok.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-screen bg-[#fafafa] text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
