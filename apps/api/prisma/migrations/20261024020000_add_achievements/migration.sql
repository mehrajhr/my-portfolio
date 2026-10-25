CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "issueDate" TIMESTAMP(3),
    "credentialId" TEXT NOT NULL DEFAULT '',
    "credentialUrl" TEXT NOT NULL DEFAULT '',
    "certificateUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Achievement_visible_sortOrder_idx" ON "Achievement"("visible", "sortOrder");

INSERT INTO "HomepageSection" ("id", "key", "title", "visible", "sortOrder", "settings", "updatedAt")
SELECT 'section_achievements', 'achievements', 'Achievements & certifications', true,
       COALESCE((SELECT MAX("sortOrder") + 1 FROM "HomepageSection"), 0), '{}', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "HomepageSection" WHERE "key" = 'achievements');
