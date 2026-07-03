import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  upsertByName(name: string) {
    return this.prisma.warehouse.upsert({ where: { name }, update: {}, create: { name } });
  }
}
