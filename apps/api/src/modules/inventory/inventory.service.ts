import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { toPagination } from '../../shared/pagination.dto';
import { InventoryQueryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async latest(query: InventoryQueryDto) {
    const latest = await this.prisma.inventorySnapshot.findFirst({ orderBy: { importedAt: 'desc' } });
    if (!latest) return { items: [], total: 0, page: query.page, pageSize: query.pageSize };

    const where: Prisma.InventoryItemWhereInput = {
      snapshotId: latest.id,
      warehouseId: query.warehouseId,
      product: query.search
        ? { OR: [{ code: { contains: query.search, mode: 'insensitive' } }, { originalName: { contains: query.search, mode: 'insensitive' } }] }
        : undefined,
      quantity:
        query.stock === 'negative'
          ? { lt: 0 }
          : query.stock === 'positive'
            ? { gt: 0 }
            : query.stock === 'low'
              ? { gt: 0, lte: 5 }
              : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.inventoryItem.findMany({ where, include: { product: true, warehouse: true, snapshot: true }, ...toPagination(query), orderBy: { totalPrice: 'desc' } }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }
}
