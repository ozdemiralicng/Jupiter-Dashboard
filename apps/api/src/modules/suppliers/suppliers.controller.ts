import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupplierDto } from './dto';
import { SuppliersService } from './suppliers.service';

@ApiBearerAuth()
@ApiTags('Suppliers')
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  list() { return this.suppliers.list(); }
  @Get(':id')
  details(@Param('id') id: string) { return this.suppliers.details(id); }
  @Post()
  create(@Body() dto: SupplierDto) { return this.suppliers.create(dto); }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: SupplierDto) { return this.suppliers.update(id, dto); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.suppliers.remove(id); }
}
