-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_menu_permissions" (
    "roleId" INTEGER NOT NULL,
    "menuPermissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_menu_permissions_pkey" PRIMARY KEY ("roleId","menuPermissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_permissions_name_key" ON "menu_permissions"("name");

-- AddForeignKey
ALTER TABLE "role_menu_permissions" ADD CONSTRAINT "role_menu_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_permissions" ADD CONSTRAINT "role_menu_permissions_menuPermissionId_fkey" FOREIGN KEY ("menuPermissionId") REFERENCES "menu_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
