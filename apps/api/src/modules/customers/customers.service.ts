import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerDto } from './dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.customer.findMany({ orderBy: { name: 'asc' } }); }
  create(dto: CustomerDto) { return this.prisma.customer.create({ data: dto }); }
  async details(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
  async update(id: string, dto: CustomerDto) { await this.details(id); return this.prisma.customer.update({ where: { id }, data: dto }); }
  async remove(id: string) { await this.details(id); return this.prisma.customer.delete({ where: { id } }); }
}
