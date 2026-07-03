import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ImportParserService } from './import-parser.service';

@Injectable()
export class ImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: ImportParserService,
    private readonly products: ProductsService,
    private readonly warehouses: WarehousesService,
  ) {}

  async preview(file?: Express.Multer.File) {
    this.assertExcel(file);
    const parsed = await this.parser.parse(file.buffer);
    return { fileName: file.originalname, ...parsed, summary: this.summary(parsed.rows) };
  }

  async import(file: Express.Multer.File | undefined, userId?: string) {
    this.assertExcel(file);
    const parsed = await this.parser.parse(file.buffer);
    const importLog = await this.prisma.import.create({
      data: { fileName: file.originalname, rowCount: parsed.rows.length + parsed.errors.length, validRows: parsed.rows.length, invalidRows: parsed.errors.length, errors: parsed.errors },
    });

    if (parsed.errors.length) {
      await this.prisma.import.update({ where: { id: importLog.id }, data: { status: 'FAILED' } });
      throw new BadRequestException({ message: 'Import contains validation errors', importId: importLog.id, errors: parsed.errors });
    }

    const totalValue = parsed.rows.reduce((sum, row) => sum + row.totalPrice, 0);
    const snapshot = await this.prisma.$transaction(async (tx) => {
      const snap = await tx.inventorySnapshot.create({
        data: { importId: importLog.id, sourceFileName: file.originalname, totalRows: parsed.rows.length, totalValue: new Prisma.Decimal(totalValue) },
      });

      for (const row of parsed.rows) {
        const product = await this.products.upsertFromImport(row.productCode, row.latinName, row.unit);
        const warehouse = await this.warehouses.upsertByName(row.store);
        await tx.inventoryItem.create({
          data: {
            snapshotId: snap.id,
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: new Prisma.Decimal(row.quantity),
            unit: row.unit,
            price: new Prisma.Decimal(row.price),
            totalPrice: new Prisma.Decimal(row.totalPrice),
          },
        });
      }

      await tx.import.update({ where: { id: importLog.id }, data: { status: 'COMPLETED', completedAt: new Date(), importedById: userId } });
      await tx.auditLog.create({ data: { actorId: userId, action: 'IMPORT_INVENTORY', entity: 'Import', entityId: importLog.id, metadata: { rows: parsed.rows.length, fileName: file.originalname } } });
      return snap;
    });

    return { importId: importLog.id, snapshotId: snapshot.id, ...this.summary(parsed.rows) };
  }

  list() {
    return this.prisma.import.findMany({ orderBy: { createdAt: 'desc' }, include: { snapshot: true, importedBy: { select: { id: true, name: true, email: true } } } });
  }

  details(id: string) {
    return this.prisma.import.findUnique({ where: { id }, include: { snapshot: { include: { items: { include: { product: true, warehouse: true } } } } } });
  }

  private assertExcel(file?: Express.Multer.File): asserts file is Express.Multer.File {
    if (!file) throw new BadRequestException('Excel file is required');
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) throw new BadRequestException('Only Excel files are supported');
  }

  private summary(rows: Array<{ quantity: number; totalPrice: number }>) {
    return {
      validRows: rows.length,
      totalQuantity: rows.reduce((sum, row) => sum + row.quantity, 0),
      totalValue: rows.reduce((sum, row) => sum + row.totalPrice, 0),
    };
  }
}
