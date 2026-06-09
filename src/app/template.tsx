"use client";

import { motion } from "framer-motion";

/**
 * App-wide template — remounts on every navigation, so wrapping children in a
 * short opacity fade gives a subtle page transition between routes. Opacity
 * only (no transform) so it never interferes with sticky positioning.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
