import type { MetadataRoute } from "next";
import { API } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.SITE_URL ?? "http://localhost:3000";
  let projects: { slug: string; updatedAt?: string }[] = [];
  try {
    const response = await fetch(`${API}/projects?limit=48`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) projects = (await response.json()).items;
  } catch {
    /* Sitemap still includes stable public routes while the API is unavailable. */
  }
  return [
    {
      url: site,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...projects.map((project) => ({
      url: `${site}/projects/${project.slug}`,
      lastModified: project.updatedAt
        ? new Date(project.updatedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
