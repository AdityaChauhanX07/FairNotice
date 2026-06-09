import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FairNotice — AI-Powered Document Advocate",
  description:
    "Upload the legal document you received. Get a plain-language explanation, statute-backed analysis, and a draft response — in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
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
