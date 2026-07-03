import { Module } from '@nestjs/common';
import { MessageParserService, OfferRecommendationService, ProductNormalizationService, SearchAssistantService } from './ai-services';

@Module({
  providers: [MessageParserService, OfferRecommendationService, ProductNormalizationService, SearchAssistantService],
  exports: [MessageParserService, OfferRecommendationService, ProductNormalizationService, SearchAssistantService],
})
export class AiModule {}
