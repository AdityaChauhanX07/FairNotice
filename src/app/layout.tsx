import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import "./globals.css";

// Newsreader (serif) — headlines & editorial text
const serif = Newsreader({
  variable: "--ff-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Hanken Grotesk (sans) — body text
const sans = Hanken_Grotesk({
  variable: "--ff-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// JetBrains Mono — labels, statute references
const mono = JetBrains_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FairNotice",
  description:
    "Upload the legal document you received. Get a plain-language explanation, statute-backed analysis, and a draft response — in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0f1626",
              color: "#f8fafc",
              border: "1px solid #1e293b",
            },
          }}
        />
      </body>
    </html>
  );
}
