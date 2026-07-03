import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../shared/pagination.dto';

export class InventoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ enum: ['all', 'positive', 'low', 'negative'] })
  @IsOptional()
  @IsIn(['all', 'positive', 'low', 'negative'])
  stock?: 'all' | 'positive' | 'low' | 'negative';
}
