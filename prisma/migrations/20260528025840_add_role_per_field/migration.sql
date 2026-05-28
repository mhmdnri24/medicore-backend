/*
  Warnings:

  - Added the required column `description` to the `menu_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `menu_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `menu_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `menu_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "menu_permissions" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "path" TEXT NOT NULL;
