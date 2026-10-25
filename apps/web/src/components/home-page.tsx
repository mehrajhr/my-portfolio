"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { api, API } from "@/lib/api";
import { ThemeControl } from "@/components/theme-provider";
import { PortfolioLoader } from "@/components/portfolio-loader";

type HomeData = {
  sections: { key: string; title: string; sortOrder: number }[];
  profile: any;
  technologies: any[];
  featuredProjects: any[];
  experience: any[];
  education: any[];
  achievements: any[];
  services: any[];
  socialLinks: any[];
  settings: any;
};

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<HomeData>("/homepage")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (data?.settings?.accentColor)
      document.documentElement.style.setProperty(
        "--accent",
        data.settings.accentColor,
      );
  }, [data?.settings?.accentColor]);

  useLayoutEffect(() => {
    if (!data || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const elements = document.querySelectorAll<HTMLElement>(
      "[data-scroll-reveal], .hero-copy, .hero-visual, .project-card, .skill-group, .timeline-item, .education-card, .achievement-card, .service-card",
    );
    elements.forEach((element) => element.classList.add("reveal-observed"));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.14, rootMargin: "0px 0px -36px 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [data]);

  const profile = data?.profile;
  const nodes: Record<string, React.ReactNode> = data
    ? {
    hero: <Hero profile={profile} socialLinks={data.socialLinks} />,
        about: (
          <section className="section about-section" id="about">
            <div className="section-kicker">
              <span>01</span>
              <span>ABOUT</span>
            </div>
            <div className="about-copy">
              <h2>{profile.aboutHeading || "A little about me"}</h2>
              <p>
                {profile.bio ||
                  "Add a few lines about your background, how you approach engineering, and the problems you enjoy solving."}
              </p>
              {profile.location && (
                <p className="location-line">
                  <Icon name="pin" />
                  {profile.location}
                </p>
              )}
            </div>
          </section>
        ),
        technologies:
          data.technologies.length > 0 ? (
            <section className="section" id="skills">
              <SectionHeading
                number="02"
                eyebrow="CAPABILITIES"
                title="Skills & tools"
                description="A practical toolkit for taking products from first sketch to production."
              />
              <div className="skills-grid">
                {groupBy(data.technologies, "category").map(
                  ([category, skills]) => (
                    <article className="skill-group" key={category}>
                      <h3>{category}</h3>
                      <div className="skill-list">
                        {skills.map((skill) => (
                          <div className="skill-item" key={skill.id}>
                            {skill.logoUrl ? (
                              <img src={skill.logoUrl} alt="" loading="lazy" />
                            ) : (
                              <span className="skill-mark">
                                {skill.name.slice(0, 1)}
                              </span>
                            )}
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ),
                )}
              </div>
            </section>
          ) : null,
        "featured-projects": (
          <section className="section" id="work">
            <SectionHeading
              number="03"
              eyebrow="SELECTED WORK"
              title="Projects I’m proud of"
              description="A few examples of the products, systems, and interfaces I’ve worked on."
            />
            {data.featuredProjects.length ? (
              <div className="project-grid">
                {data.featuredProjects.map((project, index) => (
                  <ProjectCard
                    project={project}
                    key={project.id}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="empty">
                Published featured projects will appear here.
              </div>
            )}
            <div className="center-actions">
              <Link className="button button-outline" href="/projects">
                Explore all projects <Icon name="arrow" />
              </Link>
            </div>
          </section>
        ),
        experience:
          data.experience.length > 0 ? (
            <section className="section" id="experience">
              <SectionHeading
                number="04"
                eyebrow="CAREER"
                title="Experience"
                description="A record of teams, products, and problems I’ve had the opportunity to contribute to."
              />
              <div className="timeline">
                {data.experience.map((item) => (
                  <article className="timeline-item" key={item.id}>
                    <div className="timeline-date">
                      {dateRange(item.startDate, item.endDate, item.current)}
                    </div>
                    <div className="timeline-content">
                      <span className="timeline-dot" />
                      <h3>{item.role}</h3>
                      <p className="timeline-company">
                        {item.company}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        education:
          data.education.length > 0 ? (
            <section className="section" id="education">
              <SectionHeading
                number="05"
                eyebrow="EDUCATION"
                title="Educational background"
                description="The academic foundations behind my engineering practice."
              />
              <div className="education-grid">
                {data.education.map((item) => (
                  <article className="education-card" key={item.id}>
                    <span className="education-year">
                      {dateRange(item.startDate, item.endDate, false)}
                    </span>
                    <h3>
                      {item.degree}
                      {item.field ? ` · ${item.field}` : ""}
                    </h3>
                    <p>{item.institution}</p>
                    {item.description && (
                      <p className="education-description">
                        {item.description}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        achievements:
          data.achievements.length > 0 ? (
            <section className="section" id="achievements">
              <SectionHeading
                number="06"
                eyebrow="PROFESSIONAL DEVELOPMENT"
                title="Achievements & certifications"
                description="Certificates earned through focused learning, hands-on practice, and recognized training programs."
              />
              <div className="achievement-grid">
                {data.achievements.map((item, index) => (
                  <article className="achievement-card" key={item.id}>
                    {item.certificateUrl && (
                      <a
                        className="achievement-art"
                        href={item.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open certificate for ${item.title}`}
                      >
                        {item.certificateUrl.toLowerCase().includes(".pdf") ? (
                          <span className="achievement-file-mark">PDF</span>
                        ) : (
                          <img
                            src={item.certificateUrl}
                            alt={`${item.title} certificate`}
                            loading="lazy"
                          />
                        )}
                      </a>
                    )}
                    <div className="achievement-copy">
                      <div className="achievement-meta">
                        <span>
                          ✦ &nbsp;CERTIFICATE{" "}
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.issueDate && (
                          <time dateTime={item.issueDate}>
                            {new Date(item.issueDate).toLocaleDateString(
                              undefined,
                              { month: "short", year: "numeric" },
                            )}
                          </time>
                        )}
                      </div>
                      <h3>{item.title}</h3>
                      <p className="achievement-issuer">{item.issuer}</p>
                      {item.description && (
                        <p className="achievement-description">
                          {item.description}
                        </p>
                      )}
                      <div className="achievement-actions">
                        {item.credentialUrl && (
                          <a
                            className="achievement-verify"
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Verify credential <Icon name="arrow" />
                          </a>
                        )}
                        {item.credentialId && (
                          <span className="achievement-id">
                            ID {item.credentialId}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        services:
          data.services.length > 0 ? (
            <section className="section">
              <SectionHeading
                number="07"
                eyebrow="HOW I CAN HELP"
                title="From idea to launch"
              />
              <div className="services-grid">
                {data.services.map((service) => (
                  <article className="service-card" key={service.id}>
                    <span className="service-icon">
                      <Icon name="spark" />
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        contact: (
          <section className="section contact-section" id="contact">
            <div className="contact-copy">
              <div className="section-kicker">
                <span>08</span>
                <span>LET’S TALK</span>
              </div>
              <h2>
                Have a good problem?
                <br />
                <em>I’d love to hear about it.</em>
              </h2>
              <p>
                I’m open to software engineering roles and thoughtful
                collaborations. Send a note and I’ll get back to you.
              </p>
              {profile.email && (
                <a className="contact-email" href={`mailto:${profile.email}`}>
                  {profile.email}
                  <Icon name="arrow" />
                </a>
              )}
              <div className="contact-socials">
                {getPublicSocialLinks(profile, data.socialLinks).map((link) => (
                  <SocialButton key={link.id} href={link.url} label={link.label} icon={link.icon} />
                ))}
              </div>
            </div>
            <ContactForm />
          </section>
        ),
      }
    : {};
  const ordered = data
    ? [...data.sections].sort((a, b) =>
        a.key === "hero"
          ? -1
          : b.key === "hero"
            ? 1
            : a.sortOrder - b.sortOrder,
      )
    : [];

  return (
    <div className="portfolio-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/">
            {profile?.name || "PORTFOLIO"}
            <span className="brand-dot">.</span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="/#about">About</a>
            <a href="/#skills">Skills</a>
            <a href="/#work">Projects</a>
            {data?.sections.some((s) => s.key === "experience") && (
              <a href="/#experience">Experience</a>
            )}
            {data?.sections.some((s) => s.key === "education") &&
              data.education.length > 0 && <a href="/#education">Education</a>}
            {data?.sections.some((s) => s.key === "achievements") &&
              data.achievements.length > 0 && (
                <a href="/#achievements">Certificates</a>
              )}
            <ThemeControl />
            <a className="nav-contact" href="/#contact">
              Let’s talk <Icon name="arrow" />
            </a>
          </nav>
        </div>
      </header>
      <main id="main-content" className="container">
        {!data && !error && <PortfolioLoader />}
        {error && (
          <div className="loading-state">
            Portfolio content is temporarily unavailable.
          </div>
        )}
        {data && (
          <>
            {ordered.map((section) => (
              <div
                className="reveal-block"
                data-scroll-reveal
                key={section.key}
              >
                {nodes[section.key] ?? null}
              </div>
            ))}
            <footer className="site-footer">
              <Link className="brand" href="/">
                {profile?.name || "PORTFOLIO"}
                <span className="brand-dot">.</span>
              </Link>
              <span>Designed & built with care.</span>
              <span>
                © {new Date().getFullYear()} {profile?.name || "Portfolio"}
              </span>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

function Hero({ profile, socialLinks }: { profile: any; socialLinks: any[] }) {
  const initials = (profile?.name || "ME")
    .split(/\s+/)
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="availability">
          <span
            className={
              profile?.availableForWork
                ? "availability-dot"
                : "availability-dot unavailable"
            }
          />
          {profile?.availableForWork
            ? "Open to opportunities"
            : "Currently focused on building"}
        </div>
        <p className="hero-overline">HELLO, I’M</p>
        <h1 id="hero-title">
          {profile?.name || "Your Name"}
          <span className="brand-dot">.</span>
        </h1>
        <h2>{profile?.headline || "Software Engineer"}</h2>
        <p className="hero-tagline">
          {profile?.tagline ||
            "Full Stack Developer · Building thoughtful digital products"}
        </p>
        {profile?.location && (
          <p className="hero-location">
            <Icon name="pin" />
            {profile.location}
          </p>
        )}
        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            View my work <Icon name="arrow" />
          </a>
          {profile?.resumeUrl && (
            <a className="button button-outline" href={`${API}/resume`}>
              Download resume <Icon name="download" />
            </a>
          )}
        </div>
        <div className="hero-socials">
          {getPublicSocialLinks(profile, socialLinks).map((link) => (
            <SocialButton key={link.id} href={link.url} label={link.label} icon={link.icon} />
          ))}
        </div>
      </div>
      <div className="hero-visual">
        <div className="portrait-frame">
          <div className="portrait-accent" />
          {profile?.portraitUrl ? (
            <img
              className="portrait-image"
              src={profile.portraitUrl}
              alt={`${profile?.name || "Profile"} — ${profile?.headline || "Software Engineer"}`}
              fetchPriority="high"
            />
          ) : (
            <div className="portrait-placeholder">
              <span>{initials}</span>
              <small>YOUR PHOTO</small>
            </div>
          )}
          <div className="portrait-caption">
            <span>SOFTWARE ENGINEER</span>
            <span>AVAILABLE WORLDWIDE</span>
          </div>
        </div>
        <span className="hero-coordinate">
          {profile?.location || "REMOTE · WORLDWIDE"}
        </span>
      </div>
    </section>
  );
}

export function ProjectCard({
  project,
  index = 0,
}: {
  project: any;
  index?: number;
}) {
  return (
    <article className="project-card">
      <Link
        className="project-card-main"
        href={`/projects/${project.slug}`}
        aria-label={`View details for ${project.title}`}
      >
        <div className="project-art">
          {project.coverImage ? (
            <img src={project.coverImage} alt="" loading="lazy" />
          ) : (
            <div className={`project-art-placeholder art-${index % 3}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon name="spark" />
            </div>
          )}
          <span className="project-open">
            <Icon name="arrow" />
          </span>
        </div>
        <div className="project-card-copy">
          <div className="project-meta">
            {project.categories?.length > 0 && (
              <span>
                {project.categories
                  .map((x: any) => x.category.name)
                  .join(" · ")}
              </span>
            )}
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <div className="project-stack-label">TECH STACK</div>
          <div className="project-tech-stack" aria-label="Technology stack">
            {project.technologies?.slice(0, 6).map((x: any) => (
              <span className="project-tech-chip" key={x.technology.id}>
                {x.technology.logoUrl ? (
                  <img src={x.technology.logoUrl} alt="" loading="lazy" />
                ) : (
                  <span className="project-tech-mark">
                    {x.technology.name.slice(0, 1)}
                  </span>
                )}
                <span>{x.technology.name}</span>
              </span>
            ))}
            {project.technologies?.length > 6 && (
              <span className="project-tech-more">
                +{project.technologies.length - 6}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="project-card-actions">
        {project.liveUrl && (
          <a
            className="project-action project-action-live"
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
          >
            Live demo <Icon name="arrow" />
          </a>
        )}
        {project.frontendRepoUrl && (
          <a
            className="project-action"
            href={project.frontendRepoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Frontend repo ↗
          </a>
        )}
        {project.backendRepoUrl && (
          <a
            className="project-action"
            href={project.backendRepoUrl}
            target="_blank"
            rel="noreferrer"
          >
            Backend repo ↗
          </a>
        )}
        {!project.frontendRepoUrl &&
          !project.backendRepoUrl &&
          project.sourceUrl && (
            <a
              className="project-action"
              href={project.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source code ↗
            </a>
          )}
        <Link
          className="project-action project-action-details"
          href={`/projects/${project.slug}`}
        >
          Details <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div className="section-kicker">
        <span>{number}</span>
        <span>{eyebrow}</span>
      </div>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}
function SocialButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      className="social-button"
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
      aria-label={label}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </a>
  );
}
function getPublicSocialLinks(profile: any, configured: any[]) {
  const items = (configured ?? [])
    .filter((item) => item.visible !== false && item.label?.trim() && item.url)
    .map((item) => ({
      id: item.id,
      label: item.label.trim(),
      url: item.url,
      icon: socialIcon(item.label),
    }));
  const knownUrls = new Set(items.map((item) => item.url.replace(/\/$/, "").toLowerCase()));
  const fallback = [
    profile?.linkedinUrl && { id: "profile-linkedin", label: "LinkedIn", url: profile.linkedinUrl, icon: "linkedin" },
    profile?.whatsappUrl && { id: "profile-whatsapp", label: "WhatsApp", url: profile.whatsappUrl, icon: "whatsapp" },
    profile?.email && { id: "profile-email", label: "Email", url: `mailto:${profile.email}`, icon: "mail" },
  ].filter(Boolean) as { id: string; label: string; url: string; icon: string }[];
  for (const item of fallback) {
    if (!knownUrls.has(item.url.replace(/\/$/, "").toLowerCase())) items.push(item);
  }
  return items;
}
function socialIcon(label: string) {
  const value = label.trim().toLowerCase();
  if (value.includes("github")) return "github";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("whatsapp")) return "whatsapp";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("facebook")) return "facebook";
  if (value.includes("email") || value.includes("mail")) return "mail";
  return "spark";
}
function Icon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "arrow")
    return (
      <svg {...common}>
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    );
  if (name === "download")
    return (
      <svg {...common}>
        <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />
      </svg>
    );
  if (name === "pin")
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  if (name === "mail")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  if (name === "linkedin")
    return (
      <svg {...common}>
        <path d="M6 9v10M6 5v.1M10 19v-6a4 4 0 0 1 8 0v6M10 10v9" />
        <circle cx="6" cy="6" r="1" />
      </svg>
    );
  if (name === "github")
    return (
      <svg {...common}>
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.1-1.5 6.1-6.7A5.2 5.2 0 0 0 18.8 5a4.8 4.8 0 0 0-.1-3S17.5 1.6 15 3.3a13.4 13.4 0 0 0-7 0C5.5 1.6 4.3 2 4.3 2a4.8 4.8 0 0 0-.1 3A5.2 5.2 0 0 0 2.8 7.7c0 5.2 3.1 6.4 6.1 6.7A3.4 3.4 0 0 0 8 17.1V22" />
      </svg>
    );
  if (name === "instagram")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".7" fill="currentColor" />
      </svg>
    );
  if (name === "facebook")
    return (
      <svg {...common}>
        <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h2V1.4C17.3 1.2 16.3 1 15 1c-3.2 0-5 1.9-5 5.4V9H7v4h3v8" />
      </svg>
    );
  if (name === "whatsapp")
    return (
      <svg {...common}>
        <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />
        <path d="M9 9c1 3 2.5 4.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2L9 9Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l1 2.5 2.5 1-2.5 1L19 23l-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </svg>
  );
}
function groupBy(items: any[], key: string): [string, any[]][] {
  const map = new Map<string, any[]>();
  for (const item of items) {
    const value = item[key] || "Other";
    map.set(value, [...(map.get(value) || []), item]);
  }
  return Array.from(map.entries());
}
function dateRange(start: string, end: string | null, current: boolean) {
  const from = new Date(start).getFullYear();
  const to = current
    ? "Present"
    : end
      ? new Date(end).getFullYear()
      : "Present";
  return `${from} — ${to}`;
}

function ContactForm() {
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const result = await api<{
        emailStatus: "sent" | "not_configured" | "failed";
      }>("/messages", { method: "POST", body: JSON.stringify(values) });
      setStatus(
        result.emailStatus === "sent"
          ? "Thanks — your message has been sent directly to my inbox."
          : result.emailStatus === "failed"
            ? "Your message was saved, but email delivery failed. Please try again or contact me by email."
            : "Your message was saved, but email delivery is not set up yet.",
      );
      if (result.emailStatus === "sent") form.reset();
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Unable to send the message right now.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-intro">
        <span>CONTACT</span>
        <h3>Send me a message</h3>
      </div>
      <label>
        Your name
        <input
          className="field"
          name="name"
          placeholder="How should I address you?"
          required
          maxLength={100}
        />
      </label>
      <label>
        Email address
        <input
          className="field"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          maxLength={254}
        />
      </label>
      <label>
        Subject <span>(optional)</span>
        <input
          className="field"
          name="subject"
          placeholder="What would you like to discuss?"
          maxLength={160}
        />
      </label>
      <label>
        Message
        <textarea
          className="field"
          name="message"
          placeholder="A little context helps me give you a useful reply…"
          rows={4}
          minLength={10}
          maxLength={5000}
          required
        />
      </label>
      <button
        className="button button-primary submit-button"
        disabled={sending}
      >
        {sending ? "Sending…" : "Send message"}
        <Icon name="arrow" />
      </button>
      {status && (
        <p className="form-status" role="status">
          {status}
        </p>
      )}
    </form>
  );
}
