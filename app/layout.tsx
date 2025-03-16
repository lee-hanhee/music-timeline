import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // Import from geist package
import "./globals.css";
import { ThemeProvider } from "@/app/components/ui/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
