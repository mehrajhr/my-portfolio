"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ThemeControl } from "@/components/theme-provider";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProject(null);
    api(`/projects/${params.slug}`)
      .then((data) => {
        if (active) setProject(data);
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
  }, [params.slug]);
  return (
    <div className="portfolio-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/">
            Home
          </Link>
          <nav className="main-nav">
            <Link href="/projects">All projects</Link>
            <ThemeControl />
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>
      <main className="container project-detail">
        {loading ? (
          <ProjectDetailSkeleton />
        ) : error ? (
          <div className="project-error">
            <p>This project could not be loaded.</p>
            <Link className="button button-outline" href="/projects">
              Back to projects
            </Link>
          </div>
        ) : project ? (
          <>
            <Link className="project-back" href="/projects">
              ← All projects
            </Link>
            <div className="section-kicker">
              <span>PROJECT DETAIL</span>
              {project.categories?.length > 0 && (
                <span>
                  {project.categories
                    .map((x: any) => x.category.name)
                    .join(" · ")}
                </span>
              )}
            </div>
            <h1>
              {project.title}
              <span className="brand-dot">.</span>
            </h1>
            <p>{project.summary}</p>
            {project.coverImage && (
              <img
                className="cover"
                src={project.coverImage}
                alt={`${project.title} preview`}
              />
            )}
            <section
              className="detail-tech-stack"
              aria-labelledby="tech-stack-title"
            >
              <div className="detail-tech-heading">
                <span className="section-kicker">BUILT WITH</span>
                <h2 id="tech-stack-title">Technology stack</h2>
              </div>
              <div className="detail-tech-list">
                {project.technologies?.map((x: any) => (
                  <span className="detail-tech-chip" key={x.technology.id}>
                    {x.technology.logoUrl ? (
                      <img src={x.technology.logoUrl} alt="" loading="lazy" />
                    ) : (
                      <span className="project-tech-mark">
                        {x.technology.name.slice(0, 1)}
                      </span>
                    )}
                    <span className="detail-tech-name">
                      {x.technology.name}
                    </span>
                    {x.technology.category && (
                      <span className="detail-tech-category">
                        {x.technology.category}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </section>
            <article className="detail-body" style={{ marginTop: 30 }}>
              {project.description}
            </article>
            <div className="hero-actions project-links">
              {project.liveUrl && (
                <a
                  className="button button-primary"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live demo ↗
                </a>
              )}
              {project.frontendRepoUrl && (
                <a
                  className="button button-outline"
                  href={project.frontendRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Frontend repository ↗
                </a>
              )}
              {project.backendRepoUrl && (
                <a
                  className="button button-outline"
                  href={project.backendRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Backend repository ↗
                </a>
              )}
              {!project.frontendRepoUrl &&
                !project.backendRepoUrl &&
                project.sourceUrl && (
                  <a
                    className="button button-outline"
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source code ↗
                  </a>
                )}
            </div>
          </>
        ) : null}
      </main>
      <footer className="container site-footer">
        <Link className="brand" href="/projects">
          ← All projects
        </Link>
        <span>© {new Date().getFullYear()} Portfolio</span>
      </footer>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div
      className="project-detail-skeleton"
      role="status"
      aria-live="polite"
      aria-label="Loading project details"
    >
      <span className="skeleton-back" />
      <span className="skeleton-eyebrow" />
      <span className="skeleton-title" />
      <span className="skeleton-summary" />
      <span className="skeleton-cover" />
      <span className="skeleton-tags" />
      <div className="skeleton-paragraph">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
