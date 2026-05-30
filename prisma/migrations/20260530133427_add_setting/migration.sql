-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "app_name" TEXT NOT NULL,
    "logo" TEXT,
    "pavicon" TEXT,
    "version" TEXT NOT NULL,
    "time_zone" TEXT,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
