import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header
      className="fixed top-0 right-0 p-4 z-50"
      aria-label="Header Section"
    >
      <Link
        href="https://github.com/echozyr2001/life-game"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          className="bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-700 hover:border-neutral-600 hover:text-gray-200 hover:shadow-md transition-all duration-200 rounded-lg px-5 py-2.5 font-medium flex items-center justify-center"
        >
          <Image
            src="/github-mark-white.svg"
            alt="GitHub Logo"
            width={20}
            height={20}
            priority
          />
          Go to GitHub
        </Button>
      </Link>
    </header>
  );
}
