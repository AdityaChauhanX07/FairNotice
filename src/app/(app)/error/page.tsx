"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

const DEFAULT_MESSAGE =
  "An unexpected error occurred while processing your request. Please try again.";

/**
 * Reads the `?message=` query param. Isolated in its own component so it can
 * sit inside a Suspense boundary — `useSearchParams` opts the subtree into
 * client-side rendering during prerendering.
 */
function ErrorMessage() {
  const params = useSearchParams();
  const message = params.get("message")?.trim() || DEFAULT_MESSAGE;
  return (
    <p className="mt-3 text-base leading-relaxed text-muted">{message}</p>
  );
}

export default function ErrorPage() {
  return (
    <div className="bg-glow-amber flex min-h-screen items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>

        <Suspense
          fallback={
            <p className="mt-3 text-base leading-relaxed text-muted">
              {DEFAULT_MESSAGE}
            </p>
          }
        >
          <ErrorMessage />
        </Suspense>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/upload"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover hover:shadow-accent/30"
          >
            <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/40 hover:bg-surface-hover"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
