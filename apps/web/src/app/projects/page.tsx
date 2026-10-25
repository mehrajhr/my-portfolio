"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProjectCard } from "@/components/home-page";
import { ThemeControl } from "@/components/theme-provider";
import { PortfolioLoader } from "@/components/portfolio-loader";

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<any[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    api<{ items: any[] }>(`/projects?${params}`)
      .then((d) => {
        if (active) {
          setItems(d.items);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, category]);
  return (
    <div className="portfolio-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/">
            Home
          </Link>
          <nav className="main-nav">
            <Link href="/#about">About</Link>
            <Link href="/#skills">Skills</Link>
            <ThemeControl />
            <a className="nav-contact" href="/#contact">
              Let’s talk ↗
            </a>
          </nav>
        </div>
      </header>
      <main className="container project-detail">
        <div className="section-kicker">
          <span>PROJECT ARCHIVE</span>
        </div>
        <h1>
          Selected work<span className="brand-dot">.</span>
        </h1>
        <p>Products, experiments, and engineering work built with care.</p>
        <div className="filter-bar">
          <a
            href="#all"
            className={!category ? "selected" : ""}
            onClick={(e) => {
              e.preventDefault();
              setCategory("");
            }}
          >
            All work
          </a>
          {categories.map((c) => (
            <a
              href={`#${c.slug}`}
              key={c.id}
              className={category === c.slug ? "selected" : ""}
              onClick={(e) => {
                e.preventDefault();
                setCategory(c.slug);
              }}
            >
              {c.name}
            </a>
          ))}
        </div>
        <input
          className="field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name or description…"
          style={{ maxWidth: 440, marginBottom: 24 }}
        />
        {error ? (
          <div className="empty">Projects are temporarily unavailable.</div>
        ) : loading ? (
          <PortfolioLoader />
        ) : items.length ? (
          <div className="project-grid">
            {items.map((p, i) => (
              <ProjectCard project={p} key={p.id} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty">
            No published projects match this filter yet.
          </div>
        )}
      </main>
      <footer className="container site-footer">
        <Link className="brand" href="/">
          ← Back home
        </Link>
        <span>© {new Date().getFullYear()} Portfolio</span>
      </footer>
    </div>
  );
}
