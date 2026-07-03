import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupplierDto } from './dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: SupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: string, dto: SupplierDto) {
    await this.ensure(id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensure(id);
    return this.prisma.supplier.delete({ where: { id } });
  }

  async details(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id }, include: { offers: { include: { product: true } } } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  private async ensure(id: string) {
    if (!(await this.prisma.supplier.findUnique({ where: { id } }))) throw new NotFoundException('Supplier not found');
  }
}
