import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CustomerDto } from './dto';

@ApiBearerAuth()
@ApiTags('Customers')
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}
  @Get()
  list() { return this.customers.list(); }
  @Get(':id')
  details(@Param('id') id: string) { return this.customers.details(id); }
  @Post()
  create(@Body() dto: CustomerDto) { return this.customers.create(dto); }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CustomerDto) { return this.customers.update(id, dto); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.customers.remove(id); }
}
