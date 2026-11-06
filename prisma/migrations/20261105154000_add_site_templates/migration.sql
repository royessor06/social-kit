CREATE TABLE "SiteTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteTemplate_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteTemplate" (
    "id", "name", "category", "htmlContent", "variables", "active", "createdAt", "updatedAt"
)
SELECT DISTINCT
    "templateId",
    'Template historique',
    'Legacy',
    '<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body><main>Ce site utilise un ancien template. Republiez-le avec un modèle de site.</main></body></html>',
    '[]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ClientSite"
ON CONFLICT ("id") DO NOTHING;

CREATE INDEX "SiteTemplate_category_idx" ON "SiteTemplate"("category");
CREATE INDEX "SiteTemplate_active_idx" ON "SiteTemplate"("active");

ALTER TABLE "ClientSite"
ADD CONSTRAINT "ClientSite_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "SiteTemplate"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
