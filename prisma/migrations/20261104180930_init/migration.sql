-- CreateTable
CREATE TABLE "PosterTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "thumbnail" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosterCreation" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "exportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosterCreation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSite" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PosterTemplate_category_idx" ON "PosterTemplate"("category");

-- CreateIndex
CREATE INDEX "PosterTemplate_active_idx" ON "PosterTemplate"("active");

-- CreateIndex
CREATE INDEX "PosterCreation_templateId_idx" ON "PosterCreation"("templateId");

-- CreateIndex
CREATE INDEX "PosterCreation_paid_idx" ON "PosterCreation"("paid");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSite_slug_key" ON "ClientSite"("slug");

-- CreateIndex
CREATE INDEX "ClientSite_published_idx" ON "ClientSite"("published");

-- AddForeignKey
ALTER TABLE "PosterCreation" ADD CONSTRAINT "PosterCreation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PosterTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
