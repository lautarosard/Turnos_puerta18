/*
  Warnings:

  - Added the required column `numero` to the `Turno` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Turno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "visitanteId" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,
    CONSTRAINT "Turno_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Visitante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turno_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Turno" ("actualizadoEn", "creadoEn", "estado", "id", "proyectoId", "visitanteId") SELECT "actualizadoEn", "creadoEn", "estado", "id", "proyectoId", "visitanteId" FROM "Turno";
DROP TABLE "Turno";
ALTER TABLE "new_Turno" RENAME TO "Turno";
CREATE UNIQUE INDEX "Turno_visitanteId_proyectoId_estado_key" ON "Turno"("visitanteId", "proyectoId", "estado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
