"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeControl } from "@/components/theme-provider";

export type SiteNavLink = { label: string; href: string };

type SiteHeaderProps = {
  brandName?: string;
  links?: SiteNavLink[];
};

const defaultLinks: SiteNavLink[] = [
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/projects" },
  { label: "Education", href: "/#education" },
  { label: "Certificates", href: "/#achievements" },
];

export function SiteHeader({
  brandName = "Home",
  links = defaultLinks,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" onClick={closeMenu}>
          {brandName}
          <span className="brand-dot">.</span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
          <ThemeControl />
          <a className="nav-contact" href="/#contact">
            Let’s talk <span aria-hidden="true">↗</span>
          </a>
        </nav>

        <button
          className={`mobile-menu-toggle${menuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="menu-icon" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <div
          className="mobile-nav-panel"
          id="mobile-site-menu"
          hidden={!menuOpen}
        >
          <p className="mobile-nav-heading">NAVIGATION</p>
          <nav aria-label="Mobile navigation">
            {links.map((link, index) => (
              <Link
                href={link.href}
                key={link.label}
                onClick={closeMenu}
              >
                <span>{link.label}</span>
                <span className="mobile-nav-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mobile-nav-actions">
            <ThemeControl />
            <a className="nav-contact" href="/#contact" onClick={closeMenu}>
              Let’s talk <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
