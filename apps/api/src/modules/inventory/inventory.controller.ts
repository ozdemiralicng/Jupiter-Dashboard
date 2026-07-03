import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryQueryDto } from './inventory.dto';
import { InventoryService } from './inventory.service';

@ApiBearerAuth()
@ApiTags('Inventory')
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  latest(@Query() query: InventoryQueryDto) {
    return this.inventory.latest(query);
  }
}
