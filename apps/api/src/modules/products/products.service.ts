import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationQueryDto, toPagination } from '../../shared/pagination.dto';
import { ProductNormalizerService } from './product-normalizer.service';

const PRODUCT_SORT_FIELDS = ['code', 'originalName', 'brand', 'model', 'capacity', 'color', 'region', 'createdAt', 'updatedAt'] as const;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly normalizer: ProductNormalizerService,
  ) {}

  async list(query: PaginationQueryDto) {
    const where: Prisma.ProductWhereInput = query.search
      ? { OR: [{ code: { contains: query.search, mode: 'insensitive' } }, { originalName: { contains: query.search, mode: 'insensitive' } }] }
      : {};
    const sortBy: (typeof PRODUCT_SORT_FIELDS)[number] = PRODUCT_SORT_FIELDS.includes(query.sortBy as (typeof PRODUCT_SORT_FIELDS)[number])
      ? (query.sortBy as (typeof PRODUCT_SORT_FIELDS)[number])
      : 'updatedAt';
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, ...toPagination(query), orderBy: { [sortBy]: query.sortDir ?? 'desc' } }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        marketPrices: { orderBy: { observedAt: 'desc' }, take: 30 },
        items: { include: { warehouse: true, snapshot: true }, orderBy: { snapshot: { importedAt: 'desc' } }, take: 30 },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async upsertFromImport(code: string, originalName: string, unit?: string, tx?: Prisma.TransactionClient) {
    const normalized = this.normalizer.normalize(originalName);
    const client = tx ?? this.prisma;
    return client.product.upsert({
      where: { code },
      update: { originalName, unit, ...normalized },
      create: { code, originalName, unit, ...normalized },
    });
  }
}
