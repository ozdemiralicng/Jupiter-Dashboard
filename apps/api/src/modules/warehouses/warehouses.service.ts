import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  upsertByName(name: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    return client.warehouse.upsert({ where: { name }, update: {}, create: { name } });
  }
}
