-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "numReviews" INTEGER DEFAULT 0,
ALTER COLUMN "averageRating" DROP NOT NULL;
