import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  menuLabelKey,
  permissionToSlug,
  sectionTitleKey,
} from './menu.constants';

export interface MenuItemDto {
  id: number;
  slug: string;
  name: string | null;
  labelKey: string;
  description: string | null;
  icon: string | null;
  path: string | null;
  level: number | null;
}

export interface MenuSectionDto {
  id: number;
  title: string;
  titleKey: string;
  items: MenuItemDto[];
}

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getMenusForUser(userId: number): Promise<MenuSectionDto[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roleIds = userRoles.map((ur) => ur.roleId);
    const isSuperAdmin = userRoles.some((ur) => ur.role.name === 'SUPER_ADMIN');

    const allMenus = await this.prisma.menuPermission.findMany({
      orderBy: { id: 'asc' },
    });

    const parents = allMenus.filter((m) => m.level === 1 && m.parentId == null);
    const children = allMenus.filter((m) => m.level === 2 && m.parentId != null);

    let allowedChildIds: Set<number>;

    if (isSuperAdmin) {
      allowedChildIds = new Set(children.map((c) => c.id));
    } else if (roleIds.length === 0) {
      allowedChildIds = new Set();
    } else {
      const roleMenus = await this.prisma.roleMenuPermission.findMany({
        where: { roleId: { in: roleIds } },
        select: { menuPermissionId: true },
      });
      allowedChildIds = new Set(roleMenus.map((rm) => rm.menuPermissionId));
    }

    return parents
      .map((parent) => {
        const items = children
          .filter(
            (child) =>
              child.parentId === parent.id && allowedChildIds.has(child.id),
          )
          .map((child) => {
            const slug = permissionToSlug(child.name);
            return {
              id: child.id,
              slug,
              name: child.name,
              labelKey: menuLabelKey(slug),
              description: child.description,
              icon: child.icon,
              path: child.path ?? `/${slug}`,
              level: child.level,
            };
          });

        return {
          id: parent.id,
          title: parent.name ?? '',
          titleKey: sectionTitleKey(parent.name ?? ''),
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }
}
