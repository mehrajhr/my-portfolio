import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { PrismaClient, ProjectStatus } from "@prisma/client";
import argon2 from "argon2";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  categoryInput,
  profileInput,
  projectInput,
  technologyInput,
} from "@portfolio/contracts";

const prisma = new PrismaClient();
const SESSION = "portfolio_session";
const COOKIE_SECURE = process.env.NODE_ENV === "production";
const app = express();
const api = express.Router();
type AuthedRequest = Request & { ownerId?: string };

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(
  "/api/v1/admin/media/upload",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use((req, res, next) =>
  express.json({
    limit:
      req.path === "/api/v1/admin/media/upload"
        ? "22mb"
        : req.path.startsWith("/api/v1/admin/projects")
          ? "5mb"
          : "1mb",
  })(req, res, next),
);
app.use(cookieParser());
app.get("/health", (_req, res) => res.json({ ok: true }));

function hash(value: string) {
  return createHmac(
    "sha256",
    process.env.SESSION_SECRET ?? "development-only-session-secret",
  )
    .update(value)
    .digest("hex");
}
function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}
function csrfCookieOptions(maxAge?: number) {
  return {
    httpOnly: false,
    secure: COOKIE_SECURE,
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge ? { maxAge } : {}),
  };
}
function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const cookie = req.cookies?.portfolio_csrf;
  const header = req.get("x-csrf-token");
  if (
    !cookie ||
    !header ||
    cookie.length !== header.length ||
    !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))
  ) {
    return res
      .status(403)
      .json({ error: { code: "CSRF", message: "Invalid request token" } });
  }
  next();
}
async function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION];
    if (!token)
      return res
        .status(401)
        .json({
          error: { code: "UNAUTHENTICATED", message: "Sign in required" },
        });
    const session = await prisma.session.findUnique({
      where: { tokenHash: hash(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      res.clearCookie(SESSION, cookieOptions());
      return res
        .status(401)
        .json({
          error: { code: "UNAUTHENTICATED", message: "Sign in required" },
        });
    }
    req.ownerId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
}
const owner = [requireCsrf, auth];
function parse<T>(
  schema: {
    safeParse: (data: unknown) => {
      success: boolean;
      data?: T;
      error?: { flatten: () => unknown };
    };
  },
  data: unknown,
  res: Response,
): T | undefined {
  const result = schema.safeParse(data);
  if (!result.success) {
    res
      .status(400)
      .json({
        error: { code: "VALIDATION", details: result.error?.flatten() },
      });
    return undefined;
  }
  return result.data;
}

api.post(
  "/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  async (req, res) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body?.password === "string" ? req.body.password : "";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password)))
      return res
        .status(401)
        .json({
          error: {
            code: "LOGIN_FAILED",
            message: "Email or password is incorrect",
          },
        });
    const rawToken = randomBytes(32).toString("base64url");
    const csrf = randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { tokenHash: hash(rawToken), userId: user.id, expiresAt },
    });
    res.cookie(SESSION, rawToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
    res.cookie(
      "portfolio_csrf",
      csrf,
      csrfCookieOptions(7 * 24 * 60 * 60 * 1000),
    );
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  },
);
api.post("/auth/logout", ...owner, async (req: AuthedRequest, res) => {
  const token = req.cookies?.[SESSION];
  if (token)
    await prisma.session.deleteMany({ where: { tokenHash: hash(token) } });
  res.clearCookie(SESSION, cookieOptions());
  res.clearCookie("portfolio_csrf", csrfCookieOptions());
  res.status(204).end();
});
api.get("/auth/me", auth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.ownerId },
    select: { id: true, email: true, name: true },
  });
  if (!user)
    return res.status(401).json({ error: { code: "UNAUTHENTICATED" } });
  res.json({ user });
});
api.post("/auth/change-password", ...owner, async (req: AuthedRequest, res) => {
  const current = String(req.body?.currentPassword ?? "");
  const next = String(req.body?.newPassword ?? "");
  if (next.length < 12)
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "New password must be at least 12 characters",
        },
      });
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.ownerId },
  });
  if (!(await argon2.verify(user.passwordHash, current)))
    return res.status(400).json({ error: { code: "PASSWORD_INVALID" } });
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await argon2.hash(next, { type: argon2.argon2id }) },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  res.clearCookie(SESSION, cookieOptions());
  res.status(204).end();
});

api.get("/projects", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const where: any = { status: ProjectStatus.PUBLISHED };
  if (req.query.featured === "true") where.featured = true;
  if (typeof req.query.search === "string" && req.query.search.trim())
    where.OR = [
      { title: { contains: req.query.search.trim(), mode: "insensitive" } },
      { summary: { contains: req.query.search.trim(), mode: "insensitive" } },
    ];
  if (typeof req.query.category === "string" && req.query.category)
    where.categories = { some: { category: { slug: req.query.category } } };
  if (typeof req.query.technology === "string" && req.query.technology)
    where.technologies = {
      some: { technology: { slug: req.query.technology } },
    };
  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        categories: { include: { category: true } },
        technologies: { include: { technology: true } },
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [
        { featured: "desc" },
        { featuredOrder: "asc" },
        { publishedAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);
  res.json({
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
api.get("/projects/:slug", async (req, res) => {
  const project = await prisma.project.findFirst({
    where: { slug: String(req.params.slug), status: ProjectStatus.PUBLISHED },
    include: {
      categories: { include: { category: true } },
      technologies: { include: { technology: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) return res.status(404).json({ error: { code: "NOT_FOUND" } });
  res.json(project);
});
api.get("/admin/projects", ...owner, async (_req, res) =>
  res.json(
    await prisma.project.findMany({
      include: {
        categories: { include: { category: true } },
        technologies: { include: { technology: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ),
);
api.post("/admin/projects", ...owner, async (req, res) => {
  const data = parse(projectInput, req.body, res);
  if (!data) return;
  const { categoryIds, technologyIds, published, ...fields } = data;
  const project = await prisma.project.create({
    data: {
      ...fields,
      status: published ? ProjectStatus.PUBLISHED : ProjectStatus.DRAFT,
      publishedAt: published ? new Date() : null,
      categories: {
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      technologies: {
        create: technologyIds.map((technologyId) => ({
          technology: { connect: { id: technologyId } },
        })),
      },
    },
  });
  res.status(201).json(project);
});
api.patch("/admin/projects/:id", ...owner, async (req, res) => {
  const data = parse(projectInput, req.body, res);
  if (!data) return;
  const { categoryIds, technologyIds, published, ...fields } = data;
  const previous = await prisma.project.findUniqueOrThrow({
    where: { id: String(req.params.id) },
  });
  const project = await prisma.project.update({
    where: { id: String(req.params.id) },
    data: {
      ...fields,
      status: published ? ProjectStatus.PUBLISHED : ProjectStatus.DRAFT,
      publishedAt: published ? (previous.publishedAt ?? new Date()) : null,
      categories: {
        deleteMany: {},
        create: categoryIds.map((categoryId) => ({
          category: { connect: { id: categoryId } },
        })),
      },
      technologies: {
        deleteMany: {},
        create: technologyIds.map((technologyId) => ({
          technology: { connect: { id: technologyId } },
        })),
      },
    },
  });
  res.json(project);
});
api.delete("/admin/projects/:id", ...owner, async (req, res) => {
  await prisma.project.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});

api.get("/technologies", async (_req, res) =>
  res.json(
    await prisma.technology.findMany({
      where: { visible: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ),
);
api.get("/admin/technologies", ...owner, async (_req, res) =>
  res.json(
    await prisma.technology.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ),
);
api.post("/admin/technologies", ...owner, async (req, res) => {
  const data = parse(technologyInput, req.body, res);
  if (!data) return;
  res.status(201).json(await prisma.technology.create({ data }));
});
api.patch("/admin/technologies/:id", ...owner, async (req, res) => {
  const data = parse(technologyInput, req.body, res);
  if (!data) return;
  res.json(
    await prisma.technology.update({
      where: { id: String(req.params.id) },
      data,
    }),
  );
});
api.delete("/admin/technologies/:id", ...owner, async (req, res) => {
  await prisma.technology.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});

api.get("/categories", async (_req, res) =>
  res.json(await prisma.category.findMany({ orderBy: { name: "asc" } })),
);
api.post("/admin/categories", ...owner, async (req, res) => {
  const data = parse(categoryInput, req.body, res);
  if (!data) return;
  res.status(201).json(await prisma.category.create({ data }));
});
api.delete("/admin/categories/:id", ...owner, async (req, res) => {
  await prisma.category.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});

api.get("/profile", async (_req, res) =>
  res.json(
    await prisma.profile.upsert({
      where: { id: "owner" },
      create: {},
      update: {},
    }),
  ),
);
api.patch("/admin/profile", ...owner, async (req, res) => {
  const data = parse(profileInput, req.body, res);
  if (!data) return;
  res.json(
    await prisma.profile.upsert({
      where: { id: "owner" },
      create: { id: "owner", ...data },
      update: data,
    }),
  );
});
api.get("/resume", async (_req, res) => {
  const profile = await prisma.profile.findUnique({
    where: { id: "owner" },
    select: { resumeUrl: true, name: true },
  });
  if (
    !profile?.resumeUrl ||
    !profile.resumeUrl.startsWith("https://res.cloudinary.com/")
  )
    return res.status(404).json({ error: { code: "RESUME_NOT_FOUND" } });
  const file = await fetch(profile.resumeUrl);
  if (!file.ok) {
    console.error("Résumé delivery failed at Cloudinary", {
      status: file.status,
      resourcePath: new URL(profile.resumeUrl).pathname,
    });
    if (file.status === 401)
      return res
        .status(503)
        .json({
          error: {
            code: "PDF_DELIVERY_BLOCKED",
            message:
              "The résumé uploaded, but Cloudinary is blocking PDF delivery. In your Cloudinary Console, open Settings → Security and enable “Allow delivery of PDF and ZIP files”.",
          },
        });
    return res
      .status(502)
      .json({
        error: {
          code: "RESUME_UNAVAILABLE",
          message:
            "Cloudinary could not deliver the résumé file. Check its delivery settings and try again.",
        },
      });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 20 * 1024 * 1024)
    return res.status(502).json({ error: { code: "RESUME_TOO_LARGE" } });
  const safeName = `${
    profile.name
      .replace(/[^a-z0-9 -]/gi, "")
      .trim()
      .replace(/\s+/g, "-") || "Portfolio"
  }-Resume.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(bytes);
});
api.get("/homepage", async (_req, res) => {
  const [
    sections,
    profile,
    technologies,
    featuredProjects,
    experience,
    education,
    achievements,
    services,
    socialLinks,
    settings,
  ] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.profile.upsert({ where: { id: "owner" }, create: {}, update: {} }),
    prisma.technology.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: {
        technologies: { include: { technology: true } },
        categories: { include: { category: true } },
      },
      orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }],
      take: 6,
    }),
    prisma.experience.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.education.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.$queryRaw<
      any[]
    >`SELECT * FROM "Achievement" WHERE "visible" = true ORDER BY "sortOrder" ASC, "issueDate" DESC`,
    prisma.service.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSettings.upsert({
      where: { id: "site" },
      create: {},
      update: {},
    }),
  ]);
  res.json({
    sections,
    profile,
    technologies,
    featuredProjects,
    experience,
    education,
    achievements,
    services,
    socialLinks,
    settings,
  });
});
api.get("/admin/homepage/sections", ...owner, async (_req, res) =>
  res.json(
    await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
  ),
);
api.patch("/admin/homepage/sections", ...owner, async (req, res) => {
  if (!Array.isArray(req.body?.sections))
    return res.status(400).json({ error: { code: "VALIDATION" } });
  await prisma.$transaction(
    req.body.sections.map((s: any, i: number) =>
      prisma.homepageSection.update({
        where: { key: String(s.key) },
        data: {
          visible: Boolean(s.visible),
          sortOrder: i,
          title: String(s.title).slice(0, 120),
        },
      }),
    ),
  );
  res.json(
    await prisma.homepageSection.findMany({ orderBy: { sortOrder: "asc" } }),
  );
});

api.get("/experience", async (_req, res) =>
  res.json(await prisma.experience.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.get("/education", async (_req, res) =>
  res.json(await prisma.education.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.get("/social-links", async (_req, res) =>
  res.json(
    await prisma.socialLink.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
  ),
);
api.get("/admin/experience", ...owner, async (_req, res) =>
  res.json(await prisma.experience.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.post("/admin/experience", ...owner, async (req, res) => {
  const {
    company,
    role,
    location = "",
    description = "",
    startDate,
    endDate,
    current = false,
    sortOrder = 0,
  } = req.body ?? {};
  if (
    typeof company !== "string" ||
    !company.trim() ||
    typeof role !== "string" ||
    !role.trim() ||
    !startDate ||
    Number.isNaN(Date.parse(startDate))
  )
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "Company, role, and start date are required",
        },
      });
  res
    .status(201)
    .json(
      await prisma.experience.create({
        data: {
          company: company.trim(),
          role: role.trim(),
          location,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          current: Boolean(current),
          sortOrder: Number(sortOrder) || 0,
        },
      }),
    );
});
api.patch("/admin/experience/:id", ...owner, async (req, res) => {
  const {
    company,
    role,
    location = "",
    description = "",
    startDate,
    endDate,
    current = false,
    sortOrder = 0,
  } = req.body ?? {};
  if (
    typeof company !== "string" ||
    !company.trim() ||
    typeof role !== "string" ||
    !role.trim() ||
    !startDate ||
    Number.isNaN(Date.parse(startDate))
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res.json(
    await prisma.experience.update({
      where: { id: String(req.params.id) },
      data: {
        company: company.trim(),
        role: role.trim(),
        location,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        current: Boolean(current),
        sortOrder: Number(sortOrder) || 0,
      },
    }),
  );
});
api.delete("/admin/experience/:id", ...owner, async (req, res) => {
  await prisma.experience.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
api.get("/admin/education", ...owner, async (_req, res) =>
  res.json(await prisma.education.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.post("/admin/education", ...owner, async (req, res) => {
  const {
    institution,
    degree,
    field = "",
    description = "",
    startDate,
    endDate,
    sortOrder = 0,
  } = req.body ?? {};
  if (
    typeof institution !== "string" ||
    !institution.trim() ||
    typeof degree !== "string" ||
    !degree.trim() ||
    !startDate ||
    Number.isNaN(Date.parse(startDate))
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res
    .status(201)
    .json(
      await prisma.education.create({
        data: {
          institution: institution.trim(),
          degree: degree.trim(),
          field,
          description,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          sortOrder: Number(sortOrder) || 0,
        },
      }),
    );
});
api.patch("/admin/education/:id", ...owner, async (req, res) => {
  const {
    institution,
    degree,
    field = "",
    description = "",
    startDate,
    endDate,
    sortOrder = 0,
  } = req.body ?? {};
  if (
    typeof institution !== "string" ||
    !institution.trim() ||
    typeof degree !== "string" ||
    !degree.trim() ||
    !startDate ||
    Number.isNaN(Date.parse(startDate))
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res.json(
    await prisma.education.update({
      where: { id: String(req.params.id) },
      data: {
        institution: institution.trim(),
        degree: degree.trim(),
        field,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: Number(sortOrder) || 0,
      },
    }),
  );
});
api.delete("/admin/education/:id", ...owner, async (req, res) => {
  await prisma.education.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
api.get("/admin/achievements", ...owner, async (_req, res) =>
  res.json(
    await prisma.$queryRaw<
      any[]
    >`SELECT * FROM "Achievement" ORDER BY "sortOrder" ASC, "issueDate" DESC`,
  ),
);
api.post("/admin/achievements", ...owner, async (req, res) => {
  const {
    title,
    issuer,
    description = "",
    issueDate,
    credentialId = "",
    credentialUrl = "",
    certificateUrl = "",
    sortOrder = 0,
    visible = true,
  } = req.body ?? {};
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof issuer !== "string" ||
    !issuer.trim() ||
    (credentialUrl && !URL.canParse(credentialUrl)) ||
    (certificateUrl && !URL.canParse(certificateUrl)) ||
    (issueDate && Number.isNaN(Date.parse(issueDate)))
  )
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "Provide a title, issuer, valid date, and valid URLs",
        },
      });
  const [achievement] = await prisma.$queryRaw<
    any[]
  >`INSERT INTO "Achievement" ("id", "title", "issuer", "description", "issueDate", "credentialId", "credentialUrl", "certificateUrl", "sortOrder", "visible", "createdAt", "updatedAt") VALUES (${randomBytes(12).toString("base64url")}, ${title.trim()}, ${issuer.trim()}, ${String(description)}, ${issueDate ? new Date(issueDate) : null}, ${String(credentialId)}, ${String(credentialUrl)}, ${String(certificateUrl)}, ${Number(sortOrder) || 0}, ${Boolean(visible)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`;
  res.status(201).json(achievement);
});
api.patch("/admin/achievements/:id", ...owner, async (req, res) => {
  const {
    title,
    issuer,
    description = "",
    issueDate,
    credentialId = "",
    credentialUrl = "",
    certificateUrl = "",
    sortOrder = 0,
    visible = true,
  } = req.body ?? {};
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof issuer !== "string" ||
    !issuer.trim() ||
    (credentialUrl && !URL.canParse(credentialUrl)) ||
    (certificateUrl && !URL.canParse(certificateUrl)) ||
    (issueDate && Number.isNaN(Date.parse(issueDate)))
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  const [achievement] = await prisma.$queryRaw<
    any[]
  >`UPDATE "Achievement" SET "title"=${title.trim()}, "issuer"=${issuer.trim()}, "description"=${String(description)}, "issueDate"=${issueDate ? new Date(issueDate) : null}, "credentialId"=${String(credentialId)}, "credentialUrl"=${String(credentialUrl)}, "certificateUrl"=${String(certificateUrl)}, "sortOrder"=${Number(sortOrder) || 0}, "visible"=${Boolean(visible)}, "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${String(req.params.id)} RETURNING *`;
  if (!achievement)
    return res.status(404).json({ error: { code: "NOT_FOUND" } });
  res.json(achievement);
});
api.delete("/admin/achievements/:id", ...owner, async (req, res) => {
  const deleted =
    await prisma.$executeRaw`DELETE FROM "Achievement" WHERE "id"=${String(req.params.id)}`;
  if (!deleted) return res.status(404).json({ error: { code: "NOT_FOUND" } });
  res.status(204).end();
});
api.get("/admin/social-links", ...owner, async (_req, res) =>
  res.json(await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.post("/admin/social-links", ...owner, async (req, res) => {
  const { label, url, visible = true, sortOrder = 0 } = req.body ?? {};
  if (
    typeof label !== "string" ||
    !label.trim() ||
    typeof url !== "string" ||
    !URL.canParse(url)
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res
    .status(201)
    .json(
      await prisma.socialLink.create({
        data: {
          label: label.trim(),
          url,
          visible: Boolean(visible),
          sortOrder: Number(sortOrder) || 0,
        },
      }),
    );
});
api.patch("/admin/social-links/:id", ...owner, async (req, res) => {
  const { label, url, visible = true, sortOrder = 0 } = req.body ?? {};
  if (
    typeof label !== "string" ||
    !label.trim() ||
    typeof url !== "string" ||
    !URL.canParse(url)
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res.json(
    await prisma.socialLink.update({
      where: { id: String(req.params.id) },
      data: {
        label: label.trim(),
        url,
        visible: Boolean(visible),
        sortOrder: Number(sortOrder) || 0,
      },
    }),
  );
});
api.delete("/admin/social-links/:id", ...owner, async (req, res) => {
  await prisma.socialLink.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
api.post("/admin/media/upload", ...owner, async (req, res) => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloud || !apiKey || !apiSecret)
    return res
      .status(503)
      .json({
        error: {
          code: "MEDIA_NOT_CONFIGURED",
          message:
            "Configure Cloudinary credentials in the API environment to enable uploads",
        },
      });

  const { filename, mimeType, base64, altText = "" } = req.body ?? {};
  const kind =
    mimeType === "application/pdf"
      ? "pdf"
      : typeof mimeType === "string" && mimeType.startsWith("image/")
        ? "image"
        : "";
  if (
    !kind ||
    typeof filename !== "string" ||
    !filename.trim() ||
    typeof base64 !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
  ) {
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "Choose a valid image or PDF file",
        },
      });
  }
  const bytes = Buffer.from(base64, "base64");
  const maxBytes = kind === "pdf" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
  if (
    !bytes.length ||
    bytes.length > maxBytes ||
    (kind === "pdf" && !filename.toLowerCase().endsWith(".pdf"))
  ) {
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message:
            kind === "pdf"
              ? "PDF files must be 15 MB or smaller"
              : "Images must be 5 MB or smaller",
        },
      });
  }

  const upload = new FormData();
  upload.set(
    "file",
    new Blob([bytes], { type: mimeType }),
    filename.trim().slice(0, 180),
  );
  upload.set("folder", "portfolio");
  const resourceType = kind === "pdf" ? "raw" : "image";
  let cloudinaryResponse: globalThis.Response;
  try {
    cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/${resourceType}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        body: upload,
      },
    );
  } catch (error) {
    console.error("Cloudinary upload request failed", error);
    return res
      .status(502)
      .json({
        error: {
          code: "MEDIA_PROVIDER_UNAVAILABLE",
          message:
            "Could not reach Cloudinary. Check the API server's network connection and try again.",
        },
      });
  }
  const result = (await cloudinaryResponse.json().catch(() => ({}))) as {
    secure_url?: string;
    public_id?: string;
    error?: { message?: string };
  };
  if (!cloudinaryResponse.ok || !result.secure_url || !result.public_id) {
    const providerMessage =
      result.error?.message ?? "Cloudinary could not accept this file";
    console.error("Cloudinary upload rejected", {
      status: cloudinaryResponse.status,
      message: providerMessage,
    });
    const message =
      cloudinaryResponse.status === 401
        ? "Cloudinary rejected the API credentials. Confirm the cloud name, API key, and API secret all come from the same Cloudinary environment, then restart the API."
        : providerMessage;
    return res
      .status(502)
      .json({ error: { code: "MEDIA_UPLOAD_FAILED", message } });
  }

  const media = await prisma.media.create({
    data: {
      url: result.secure_url,
      provider: "cloudinary",
      providerKey: result.public_id,
      mimeType,
      sizeBytes: bytes.length,
      altText: String(altText).slice(0, 250),
    },
  });
  res.status(201).json({ url: media.url, publicId: media.providerKey });
});
api.post("/admin/media", ...owner, async (req, res) => {
  const {
    url,
    publicId,
    mimeType = "",
    sizeBytes = 0,
    altText = "",
  } = req.body ?? {};
  if (
    typeof url !== "string" ||
    !URL.canParse(url) ||
    !url.startsWith("https://res.cloudinary.com/") ||
    typeof publicId !== "string"
  )
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "Invalid uploaded media details",
        },
      });
  res
    .status(201)
    .json(
      await prisma.media.create({
        data: {
          url,
          provider: "cloudinary",
          providerKey: publicId,
          mimeType: String(mimeType),
          sizeBytes: Math.max(0, Number(sizeBytes) || 0),
          altText: String(altText).slice(0, 250),
        },
      }),
    );
});
api.get("/services", async (_req, res) =>
  res.json(
    await prisma.service.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
    }),
  ),
);
api.get("/admin/services", ...owner, async (_req, res) =>
  res.json(await prisma.service.findMany({ orderBy: { sortOrder: "asc" } })),
);
api.post("/admin/services", ...owner, async (req, res) => {
  const {
    title,
    description = "",
    sortOrder = 0,
    visible = true,
  } = req.body ?? {};
  if (typeof title !== "string" || !title.trim())
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res
    .status(201)
    .json(
      await prisma.service.create({
        data: {
          title: title.trim(),
          description,
          sortOrder: Number(sortOrder) || 0,
          visible: Boolean(visible),
        },
      }),
    );
});
api.patch("/admin/services/:id", ...owner, async (req, res) => {
  const {
    title,
    description = "",
    sortOrder = 0,
    visible = true,
  } = req.body ?? {};
  if (typeof title !== "string" || !title.trim())
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res.json(
    await prisma.service.update({
      where: { id: String(req.params.id) },
      data: {
        title: title.trim(),
        description,
        sortOrder: Number(sortOrder) || 0,
        visible: Boolean(visible),
      },
    }),
  );
});
api.delete("/admin/services/:id", ...owner, async (req, res) => {
  await prisma.service.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});
api.get("/settings/public", async (_req, res) =>
  res.json(
    await prisma.siteSettings.upsert({
      where: { id: "site" },
      create: {},
      update: {},
    }),
  ),
);
api.get("/seo", async (_req, res) =>
  res.json(
    await prisma.seoSettings.upsert({
      where: { id: "seo" },
      create: {},
      update: {},
    }),
  ),
);
api.patch("/admin/settings", ...owner, async (req, res) => {
  const {
    siteTitle,
    description = "",
    accentColor = "#146c5b",
  } = req.body ?? {};
  if (
    typeof siteTitle !== "string" ||
    !siteTitle.trim() ||
    typeof accentColor !== "string" ||
    !/^#[0-9a-f]{6}$/i.test(accentColor)
  )
    return res
      .status(400)
      .json({
        error: {
          code: "VALIDATION",
          message: "Provide a title and hex accent color",
        },
      });
  res.json(
    await prisma.siteSettings.upsert({
      where: { id: "site" },
      create: { siteTitle: siteTitle.trim(), description, accentColor },
      update: { siteTitle: siteTitle.trim(), description, accentColor },
    }),
  );
});
api.get("/admin/seo", ...owner, async (_req, res) =>
  res.json(
    await prisma.seoSettings.upsert({
      where: { id: "seo" },
      create: {},
      update: {},
    }),
  ),
);
api.patch("/admin/seo", ...owner, async (req, res) => {
  const {
    title,
    description = "",
    imageUrl = "",
    faviconUrl = "",
  } = req.body ?? {};
  if (
    typeof title !== "string" ||
    !title.trim() ||
    (imageUrl && !URL.canParse(imageUrl)) ||
    (faviconUrl && !URL.canParse(faviconUrl))
  )
    return res.status(400).json({ error: { code: "VALIDATION" } });
  res.json(
    await prisma.seoSettings.upsert({
      where: { id: "seo" },
      create: { title: title.trim(), description, imageUrl, faviconUrl },
      update: { title: title.trim(), description, imageUrl, faviconUrl },
    }),
  );
});

api.post(
  "/messages",
  rateLimit({ windowMs: 60 * 60 * 1000, limit: 5 }),
  async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const subject =
      typeof req.body?.subject === "string"
        ? req.body.subject.trim().slice(0, 160)
        : "";
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (
      name.length < 1 ||
      name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      message.length < 10 ||
      message.length > 5000
    )
      return res
        .status(400)
        .json({
          error: {
            code: "VALIDATION",
            message:
              "Enter a name, valid email, and message between 10 and 5000 characters",
          },
        });
    const item = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });
    let emailStatus: "sent" | "not_configured" | "failed" = "not_configured";
    const emailKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>";
    if (emailKey) {
      try {
        const delivery = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${emailKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [process.env.CONTACT_EMAIL ?? "mehrajhasanriajcse@gmail.com"],
            reply_to: email,
            subject: `Portfolio contact: ${(subject || `Message from ${name}`).replace(/[\r\n]/g, " ").slice(0, 180)}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          }),
        });
        emailStatus = delivery.ok ? "sent" : "failed";
        if (!delivery.ok) {
          const providerError = await delivery.json().catch(() => null);
          console.error("Contact email delivery failed", {
            status: delivery.status,
            providerError,
          });
        }
      } catch (error) {
        emailStatus = "failed";
        console.error("Contact email delivery failed", error);
      }
    }
    res.status(201).json({ id: item.id, emailStatus });
  },
);
api.get("/admin/messages", ...owner, async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  res.json(
    await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * 30,
      take: 30,
    }),
  );
});
api.patch("/admin/messages/:id/read", ...owner, async (req, res) =>
  res.json(
    await prisma.contactMessage.update({
      where: { id: String(req.params.id) },
      data: { status: "READ", readAt: new Date() },
    }),
  ),
);
api.delete("/admin/messages/:id", ...owner, async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: String(req.params.id) } });
  res.status(204).end();
});

app.use("/api/v1", api);
app.use((_req, res) =>
  res
    .status(404)
    .json({ error: { code: "NOT_FOUND", message: "Route not found" } }),
);
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  const code = (error as { code?: string })?.code;
  if (code === "P2002")
    return res
      .status(409)
      .json({
        error: {
          code: "CONFLICT",
          message: "A record with that value already exists",
        },
      });
  if (code === "P2025")
    return res.status(404).json({ error: { code: "NOT_FOUND" } });
  return res
    .status(500)
    .json({
      error: { code: "INTERNAL", message: "An unexpected error occurred" },
    });
});

export function createApp() {
  return app;
}
