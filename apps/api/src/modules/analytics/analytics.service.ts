import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const latest = await this.prisma.inventorySnapshot.findFirst({ orderBy: { importedAt: 'desc' } });
    const [totalProducts, warehouseCount, recentImports] = await this.prisma.$transaction([
      this.prisma.product.count(),
      this.prisma.warehouse.count(),
      this.prisma.import.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { snapshot: true } }),
    ]);

    if (!latest) {
      return { totalInventoryValue: 0, totalProducts, negativeStockCount: 0, warehouseCount, lastImportDate: null, recentImports, valueByWarehouse: [], topProductsByValue: [], lowStockProducts: [], negativeStockProducts: [] };
    }

    const items = await this.prisma.inventoryItem.findMany({ where: { snapshotId: latest.id }, include: { product: true, warehouse: true } });
    const valueByWarehouse = Object.values(
      items.reduce<Record<string, { warehouse: string; value: number }>>((acc, item) => {
        const key = item.warehouse.name;
        acc[key] = acc[key] ?? { warehouse: key, value: 0 };
        acc[key].value += Number(item.totalPrice);
        return acc;
      }, {}),
    );

    const byProduct = Object.values(
      items.reduce<Record<string, { code: string; name: string; value: number; quantity: number }>>((acc, item) => {
        const key = item.productId;
        acc[key] = acc[key] ?? { code: item.product.code, name: item.product.originalName, value: 0, quantity: 0 };
        acc[key].value += Number(item.totalPrice);
        acc[key].quantity += Number(item.quantity);
        return acc;
      }, {}),
    );

    return {
      totalInventoryValue: Number(latest.totalValue),
      totalProducts,
      negativeStockCount: items.filter((item) => Number(item.quantity) < 0).length,
      warehouseCount,
      lastImportDate: latest.importedAt,
      recentImports,
      valueByWarehouse,
      topProductsByValue: byProduct.sort((a, b) => b.value - a.value).slice(0, 10),
      lowStockProducts: byProduct.filter((item) => item.quantity > 0 && item.quantity <= 5).slice(0, 10),
      negativeStockProducts: byProduct.filter((item) => item.quantity < 0).slice(0, 10),
    };
  }
}
