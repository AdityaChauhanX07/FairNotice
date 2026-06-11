"use client";

import { useEffect, useState } from "react";

export interface NavItem {
  id: string;
  label: string;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const map = new Map<Element, string>();
    const els: Element[] = [];
    for (const item of items) {
      const el = document.getElementById(`sec-${item.id}`);
      if (el) {
        map.set(el, item.id);
        els.push(el);
      }
    }
    if (els.length === 0 || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        const id = visible[0] && map.get(visible[0].target);
        if (id) setActive(id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className="res-nav" aria-label="Report sections">
      <h6>On this page</h6>
      <div className="nav-scroll">
        {items.map((item, i) => (
          <a
            key={item.id}
            href={`#sec-${item.id}`}
            className={active === item.id ? "on" : ""}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(`sec-${item.id}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <span className="nv-i">{String(i + 1).padStart(2, "0")}</span>
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
