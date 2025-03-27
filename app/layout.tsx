// The RootLayout component defines the root HTML structure and environment for every page in the application.
// It ensures that global styles, fonts, metadata, and theming persist across all routes.

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
      <head>
        {/* Prevents theme flickering in Safari by applying theme before page renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Only run on Safari
                  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
                    const storedTheme = localStorage.getItem('theme');
                    
                    if (storedTheme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (storedTheme === 'light') {
                      document.documentElement.classList.remove('dark');
                    } else {
                      // For 'system' preference, check media query
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if (prefersDark) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  }
                } catch (e) {
                  // Fail silently
                }
              })();
            `,
          }}
        />
      </head>
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
