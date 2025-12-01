/*
  Warnings:

  - You are about to drop the column `ubicacion` on the `Proyecto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proyecto" DROP COLUMN "ubicacion",
ADD COLUMN     "pa" BOOLEAN NOT NULL DEFAULT true;
