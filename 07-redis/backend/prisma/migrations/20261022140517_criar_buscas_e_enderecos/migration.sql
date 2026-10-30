-- CreateTable
CREATE TABLE "Endereco" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Busca" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cep" TEXT NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deuCerto" BOOLEAN NOT NULL,
    "enderecoId" INTEGER,
    CONSTRAINT "Busca_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "Endereco" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Endereco_cep_key" ON "Endereco"("cep");

-- CreateIndex
CREATE INDEX "Busca_criadaEm_idx" ON "Busca"("criadaEm");
