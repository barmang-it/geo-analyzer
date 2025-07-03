
import { BusinessClassification } from '../types';

export const classifyBeverageBrand = (fullText: string): BusinessClassification | null => {
  // Enhanced major beverage brands with more specific classification
  if (fullText.includes('coca-cola') || fullText.includes('coke') || fullText.includes('coca cola')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Beverages',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (fullText.includes('pepsi') || fullText.includes('pepsico')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Snacks',
      domain: 'Global Beverage Brand'
    };
  }
  
  if (fullText.includes('dr pepper') || fullText.includes('sprite') || fullText.includes('fanta')) {
    return {
      industry: 'Food & Beverage',
      market: 'Consumer Packaged Goods',
      geography: 'Global',
      category: 'Soft Drinks & Beverages',
      domain: 'Global Beverage Brand'
    };
  }

  return null;
};
