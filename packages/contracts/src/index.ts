import { z } from "zod";

export const projectInput = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1),
  description: z.string().trim().default(""),
  liveUrl: z.string().url().or(z.literal("")).default(""),
  sourceUrl: z.string().url().or(z.literal("")).default(""),
  frontendRepoUrl: z.string().url().or(z.literal("")).default(""),
  backendRepoUrl: z.string().url().or(z.literal("")).default(""),
  coverImage: z.string().url().or(z.literal("")).default(""),
  categoryIds: z.array(z.string()).default([]),
  technologyIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  featuredOrder: z.number().int().default(0),
  published: z.boolean().default(false),
});

export const technologyInput = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().trim().min(1).max(60),
  logoUrl: z.string().url().or(z.literal("")).default(""),
  websiteUrl: z.string().url().or(z.literal("")).default(""),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const categoryInput = z.object({ name: z.string().trim().min(1).max(60), slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const profileInput = z.object({ name: z.string().trim().min(1).max(100), headline: z.string().max(180), tagline: z.string().max(240).default(""), bio: z.string().max(5000), aboutHeading: z.string().max(120).default("About me"), portraitUrl: z.string().url().or(z.literal("")).default(""), location: z.string().max(120), email: z.string().email().or(z.literal("")), linkedinUrl: z.string().url().or(z.literal("")).default(""), whatsappUrl: z.string().url().or(z.literal("")).default(""), availableForWork: z.boolean(), resumeUrl: z.string().url().or(z.literal("")) });
