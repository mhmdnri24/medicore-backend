/*
  Warnings:

  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Setting";

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "app_name" TEXT NOT NULL,
    "logo" TEXT,
    "pavicon" TEXT,
    "version" TEXT NOT NULL,
    "time_zone" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
