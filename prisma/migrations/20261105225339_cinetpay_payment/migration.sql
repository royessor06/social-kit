-- AlterTable
ALTER TABLE "PosterCreation" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT;

-- Keep previously paid simulated creations exportable after enforcing PAID.
UPDATE "PosterCreation"
SET "paymentStatus" = 'PAID'
WHERE "paid" = true;
