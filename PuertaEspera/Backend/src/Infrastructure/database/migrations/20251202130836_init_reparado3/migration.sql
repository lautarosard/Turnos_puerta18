-- DropIndex
DROP INDEX "Turno_visitanteId_proyectoId_estado_key";

-- AlterTable
ALTER TABLE "Proyecto" ALTER COLUMN "duracionEstimada" SET DEFAULT 0;
