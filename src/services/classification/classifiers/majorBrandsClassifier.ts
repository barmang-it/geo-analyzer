
import { BusinessClassification } from '../types';

export const classifyMajorBrand = (fullText: string): BusinessClassification | null => {
  // Enhanced major brands classification with content analysis
  if (fullText.includes('apple') && !fullText.includes('apple.com/developer')) {
    return {
      industry: 'Technology',
      market: 'Consumer Electronics',
      geography: 'Global',
      category: 'Consumer Technology',
      domain: 'Consumer Electronics'
    };
  }
  
  if (fullText.includes('microsoft')) {
    return {
      industry: 'Technology',
      market: 'Enterprise Software',
      geography: 'Global',
      category: 'Software & Cloud Services',
      domain: 'Enterprise Software'
    };
  }
  
  if (fullText.includes('google')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'Search & Cloud Services',
      domain: 'Cloud & Search'
    };
  }
  
  if (fullText.includes('amazon')) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'E-commerce & Cloud Services',
      domain: 'Cloud & E-commerce'
    };
  }
  
  if (fullText.includes('tesla')) {
    return {
      industry: 'Automotive',
      market: 'Electric Vehicles',
      geography: 'Global',
      category: 'Electric Vehicles & Energy',
      domain: 'Automotive Technology'
    };
  }

  return null;
};
