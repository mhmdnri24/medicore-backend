import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleInclude = {
  roleMenuPermissions: {
    include: {
      menuPermission: {
        select: {
          id: true,
          name: true,
          description: true,
          path: true,
          parentId: true,
          level: true,
          icon: true,
        },
      },
    },
  },
  _count: {
    select: { userRoles: true },
  },
} as const;

function mapRole(role: {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  roleMenuPermissions: {
    menuPermission: {
      id: number;
      name: string | null;
      description: string | null;
      path: string | null;
      parentId: number | null;
      level: number | null;
      icon: string | null;
    };
  }[];
  _count: { userRoles: number };
}) {
  return {
    id: role.id,
    name: role.name,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
    userCount: role._count.userRoles,
    permissions: role.roleMenuPermissions.map((rp) => rp.menuPermission),
  };
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
    return roles.map(mapRole);
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: roleInclude,
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return mapRole(role);
  }

  async findAllPermissions() {
    const all = await this.prisma.menuPermission.findMany({
      orderBy: { id: 'asc' },
    });

    const parents = all.filter((m) => m.level === 1 && m.parentId == null);
    const children = all.filter((m) => m.level === 2 && m.parentId != null);

    return parents.map((parent) => ({
      id: parent.id,
      name: parent.name,
      description: parent.description,
      children: children
        .filter((child) => child.parentId === parent.id)
        .map((child) => ({
          id: child.id,
          name: child.name,
          description: child.description,
          path: child.path,
          icon: child.icon,
        })),
    }));
  }

  private async validatePermissionIds(permissionIds: number[]) {
    if (permissionIds.length === 0) return;

    const permissions = await this.prisma.menuPermission.findMany({
      where: { id: { in: permissionIds } },
      select: { id: true, level: true },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }

    const invalid = permissions.some((p) => p.level !== 2);
    if (invalid) {
      throw new BadRequestException(
        'Only menu-level permissions can be assigned to roles',
      );
    }
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name.trim().toUpperCase() },
    });

    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    if (dto.permissionIds?.length) {
      await this.validatePermissionIds(dto.permissionIds);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name.trim().toUpperCase(),
        ...(dto.permissionIds?.length
          ? {
              roleMenuPermissions: {
                create: dto.permissionIds.map((menuPermissionId) => ({
                  menuPermissionId,
                })),
              },
            }
          : {}),
      },
      include: roleInclude,
    });

    return mapRole(role);
  }

  async update(id: number, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.name === 'SUPER_ADMIN' && dto.name && dto.name !== existing.name) {
      throw new BadRequestException('SUPER_ADMIN role cannot be renamed');
    }

    if (dto.name) {
      const conflict = await this.prisma.role.findFirst({
        where: {
          name: dto.name.trim().toUpperCase(),
          id: { not: id },
        },
      });

      if (conflict) {
        throw new ConflictException('Role name already exists');
      }
    }

    if (dto.permissionIds !== undefined) {
      await this.validatePermissionIds(dto.permissionIds);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          ...(dto.name !== undefined
            ? { name: dto.name.trim().toUpperCase() }
            : {}),
        },
      });

      if (dto.permissionIds !== undefined) {
        await tx.roleMenuPermission.deleteMany({ where: { roleId: id } });
        if (dto.permissionIds.length > 0) {
          await tx.roleMenuPermission.createMany({
            data: dto.permissionIds.map((menuPermissionId) => ({
              roleId: id,
              menuPermissionId,
            })),
          });
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const existing = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { userRoles: true } } },
    });

    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    if (existing.name === 'SUPER_ADMIN') {
      throw new BadRequestException('SUPER_ADMIN role cannot be deleted');
    }

    if (existing._count.userRoles > 0) {
      throw new BadRequestException(
        'Role is assigned to users and cannot be deleted',
      );
    }

    await this.prisma.$transaction([
      this.prisma.roleMenuPermission.deleteMany({ where: { roleId: id } }),
      this.prisma.role.delete({ where: { id } }),
    ]);

    return { message: 'Role deleted successfully' };
  }
}
