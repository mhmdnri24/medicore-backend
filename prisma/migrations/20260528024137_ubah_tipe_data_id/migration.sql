/*
  Warnings:

  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_roles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_roles_userId_roleId_key";

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId", "roleId");
