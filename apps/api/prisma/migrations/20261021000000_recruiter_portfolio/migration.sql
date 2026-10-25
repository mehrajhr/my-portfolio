ALTER TABLE "Project"
  ADD COLUMN "frontendRepoUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "backendRepoUrl" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Profile"
  ADD COLUMN "tagline" TEXT NOT NULL DEFAULT 'Full Stack Developer · Building thoughtful digital products',
  ADD COLUMN "aboutHeading" TEXT NOT NULL DEFAULT 'A little about me',
  ADD COLUMN "portraitUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "linkedinUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "whatsappUrl" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Profile" ALTER COLUMN "headline" SET DEFAULT 'Software Engineer';
ALTER TABLE "Profile" ALTER COLUMN "email" SET DEFAULT 'mehrajhasanriajcse@gmail.com';
UPDATE "Profile" SET "email" = 'mehrajhasanriajcse@gmail.com' WHERE "email" = '';

ALTER TABLE "SiteSettings" ALTER COLUMN "accentColor" SET DEFAULT '#146c5b';
ALTER TABLE "SiteSettings" ALTER COLUMN "theme" SET DEFAULT 'light';
UPDATE "SiteSettings" SET "accentColor" = '#146c5b' WHERE "accentColor" = '#a3e635';
UPDATE "SiteSettings" SET "theme" = 'light' WHERE "theme" = 'dark';

UPDATE "HomepageSection" SET "visible" = false WHERE "key" = 'experience';
