import { Injectable } from '@nestjs/common';

export type NormalizedProduct = {
  brand?: string;
  model?: string;
  capacity?: string;
  color?: string;
  region?: string;
};

const COLORS = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Green', 'Purple', 'Red', 'Natural Titanium', 'Desert Titanium'];
const REGIONS = ['Korea', 'UAE', 'USA', 'Japan', 'China', 'India', 'Hong Kong', 'Singapore', 'UK', 'EU'];

@Injectable()
export class ProductNormalizerService {
  normalize(input: string): NormalizedProduct {
    const clean = input.replace(/\s+/g, ' ').trim();
    const upper = clean.toUpperCase();
    const capacity = clean.match(/\b\d+\s?(GB|TB)\b/i)?.[0].replace(/\s+/g, '').toUpperCase();
    const color = COLORS.find((candidate) => upper.includes(candidate.toUpperCase()));
    const region = REGIONS.find((candidate) => upper.includes(candidate.toUpperCase()));

    if (upper.includes('IPHONE')) {
      const modelMatch = clean.match(/iPhone\s+\d+\s*(?:Pro Max|Pro|Plus|Mini)?/i);
      return { brand: 'Apple', model: modelMatch?.[0].replace(/\s+/g, ' ').trim(), capacity, color, region };
    }

    if (upper.includes('SAMSUNG') || upper.includes('GALAXY')) {
      const modelMatch = clean.match(/(?:Samsung\s+)?Galaxy\s+[A-Z0-9 ]+/i);
      return { brand: 'Samsung', model: modelMatch?.[0].trim(), capacity, color, region };
    }

    return { capacity, color, region };
  }
}
