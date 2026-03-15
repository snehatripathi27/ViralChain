import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "ViralChain",
  description: "AI-powered crypto content ideation engine for viral reels, videos, and threads."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>{children}</body>
    </html>
  );
}
