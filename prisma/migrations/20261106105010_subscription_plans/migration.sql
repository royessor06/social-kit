-- AlterTable
ALTER TABLE "PosterCreation" ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'png';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'FREE';
