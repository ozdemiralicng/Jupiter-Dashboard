import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageParserService {
  parseMessage(_message: string) {
    return { offers: [], requestedProducts: [], confidence: 0 };
  }
}

@Injectable()
export class OfferRecommendationService {
  recommendOffers(_context: unknown) {
    return { recommendations: [], rationale: 'Recommendation engine interface is ready for future AI integration.' };
  }
}

@Injectable()
export class ProductNormalizationService {
  normalize(_productText: string) {
    return { normalized: null, confidence: 0 };
  }
}

@Injectable()
export class SearchAssistantService {
  search(_query: string) {
    return { results: [], interpretedQuery: null };
  }
}
