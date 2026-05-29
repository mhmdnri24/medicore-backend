import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {

  // await prisma.$executeRaw`TRUNCATE TABLE "User", "Role", "UserRole", "MenuPermission", "RoleMenuPermission" RESTART IDENTITY CASCADE`;


  const role = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
    },
  });

  const password = await bcrypt.hash('Admin@1234', 10);
  const user = await prisma.user.upsert({
    where: { employeeId: 'admin_001' },
    update: {},
    create: {
      employeeId: 'admin_001',
      fullName: 'System Administrator',
      email: 'admin@medicore.com',
      password,
      isActive: true,
    },
  });


  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });

  const parentMenu = [{'Main':[
    {
      parentId: null,
      name: 'view:dashboard',
      description: 'Can view dashboard',
      level: 1,
      icon: 'dashboard',
    },
    {
      parentId: null,
      name: 'view:dashboard',
      description: 'Can view dashboard',
      level: 1,
      icon: 'dashboard',
    },
    {
      parentId: null,
      name: 'view:dashboard',
      description: 'Can view dashboard',
      level: 1,
      icon: 'dashboard',
    },
  ]}, { 'Master Data': [] }, { 'Settings': [] }];

  for (const parent of parentMenu) {
    const labelMenu = await prisma.menuPermission.create({
      data: {
        name: Array.isArray(parent) ? Object.keys(parent)[0] : '',
        description: '',
        level: 1,
        icon: '',
      },
    });

    const childMenus = Array.isArray(parent) ? Object.values(parent)[0] : [];
    for (const child of childMenus) {
      await prisma.menuPermission.create({
        data: {
          parentId: labelMenu.id,
          name: child.name,
          description: child.description,
          level: child.level,
          icon: child.icon,
        },
      });
    }
    
  }

  console.log('✅ Seed complete: admin_001 / Admin@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
