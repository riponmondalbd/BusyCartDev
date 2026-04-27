-- CreateTable
CREATE TABLE "DealOfDay" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealOfDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealOfDay_productId_key" ON "DealOfDay"("productId");

-- AddForeignKey
ALTER TABLE "DealOfDay" ADD CONSTRAINT "DealOfDay_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
