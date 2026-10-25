-- These categories were inserted by the original seed script. Categories are
-- now managed explicitly from the dashboard, so remove the built-in options.
DELETE FROM "ProjectCategory"
WHERE "categoryId" IN (
  SELECT "id" FROM "Category"
  WHERE "slug" IN ('frontend', 'backend', 'full-stack', 'mobile', 'devops', 'open-source')
);

DELETE FROM "Category"
WHERE "slug" IN ('frontend', 'backend', 'full-stack', 'mobile', 'devops', 'open-source');
