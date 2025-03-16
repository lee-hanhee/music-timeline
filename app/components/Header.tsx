"use client";

import { ThemeToggle } from "@/app/components/ui/theme-toggle";

export default function Header() {
  return (
    <header className="container mx-auto py-4 px-4 md:px-6 flex justify-between items-center">
      <h1 className="text-4xl font-bold">Music Timeline</h1>
      <ThemeToggle />
    </header>
  );
}
