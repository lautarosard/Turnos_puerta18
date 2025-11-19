-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN_PROYECTO'
);

-- CreateTable
CREATE TABLE "Visitante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Proyecto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "ubicacion" TEXT,
    "adminEncargadoId" TEXT NOT NULL,
    CONSTRAINT "Proyecto_adminEncargadoId_fkey" FOREIGN KEY ("adminEncargadoId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    "visitanteId" TEXT NOT NULL,
    "proyectoId" TEXT NOT NULL,
    CONSTRAINT "Turno_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Visitante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turno_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_nombre_key" ON "Proyecto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Turno_visitanteId_proyectoId_estado_key" ON "Turno"("visitanteId", "proyectoId", "estado");
