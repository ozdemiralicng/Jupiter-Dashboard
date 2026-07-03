import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ImportParserService } from './import-parser.service';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [ProductsModule, WarehousesModule],
  controllers: [ImportsController],
  providers: [ImportsService, ImportParserService],
})
export class ImportsModule {}
