import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Import from geist package
import "./globals.css";

// Use GeistSans from the geist package
const font = GeistSans;

export const metadata: Metadata = {
  title: "Music Timeline",
  description: "A Spotify-powered music timeline app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
