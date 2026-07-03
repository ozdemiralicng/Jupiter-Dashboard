import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductNormalizerService } from './product-normalizer.service';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductNormalizerService],
  exports: [ProductsService, ProductNormalizerService],
})
export class ProductsModule {}
