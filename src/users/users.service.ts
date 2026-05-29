import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userInclude = {
  userRoles: {
    include: {
      role: { select: { id: true, name: true } },
    },
  },
} as const;

function mapUser(user: {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: { role: { id: number; name: string } }[];
}) {
  return {
    id: user.id,
    employeeId: user.employeeId,
    fullName: user.fullName,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.userRoles.map((ur) => ur.role),
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(mapUser);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUser(user);
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ employeeId: dto.employeeId }, { email: dto.email }],
      },
    });

    if (existing) {
      throw new ConflictException('Employee ID or email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        employeeId: dto.employeeId,
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        isActive: dto.isActive ?? true,
        ...(dto.roleIds?.length
          ? {
              userRoles: {
                create: dto.roleIds.map((roleId) => ({ roleId })),
              },
            }
          : {}),
      },
      include: userInclude,
    });

    return mapUser(user);
  }

  async update(id: number, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.employeeId || dto.email) {
      const conflict = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(dto.employeeId ? [{ employeeId: dto.employeeId }] : []),
                ...(dto.email ? [{ email: dto.email }] : []),
              ],
            },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException('Employee ID or email already exists');
      }
    }

    const data: {
      employeeId?: string;
      fullName?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
    } = {};

    if (dto.employeeId !== undefined) data.employeeId = dto.employeeId;
    if (dto.fullName !== undefined) data.fullName = dto.fullName;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data });

      if (dto.roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId) => ({ userId: id, roleId })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { message: 'User deleted successfully' };
  }
}
