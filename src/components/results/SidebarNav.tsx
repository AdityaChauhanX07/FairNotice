"use client";

import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "summary", label: "Summary" },
  { id: "deadlines", label: "Deadlines" },
  { id: "claims", label: "Claims" },
  { id: "rights", label: "Rights" },
  { id: "options", label: "Options" },
  { id: "letter", label: "Response Letter" },
  { id: "resources", label: "Resources" },
];

export function SidebarNav() {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].id);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost section currently intersecting the viewport.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-24 hidden w-44 shrink-0 lg:block"
    >
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
        On this page
      </p>
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block rounded-lg border-l-2 px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-accent bg-accent/5 font-semibold text-accent"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
