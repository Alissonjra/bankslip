-- CreateTable
CREATE TABLE "bankslip" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "governmentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "debtAmount" DOUBLE PRECISION NOT NULL,
    "debtDueDate" TIMESTAMP(3) NOT NULL,
    "debtId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bankslip_pkey" PRIMARY KEY ("id")
);
