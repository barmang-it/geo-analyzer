
import { BusinessClassification } from '../types';

export const classifyTechnologyCompany = (fullText: string): BusinessClassification | null => {
  // Enhanced Akamai detection with website content
  if (fullText.includes('akamai') || 
      (fullText.includes('cdn') && fullText.includes('security')) ||
      (fullText.includes('edge') && fullText.includes('computing') && fullText.includes('performance')) ||
      (fullText.includes('content delivery') && fullText.includes('ddos'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }
  
  // CloudFlare and similar CDN providers
  if (fullText.includes('cloudflare') || fullText.includes('cloud flare') ||
      (fullText.includes('content delivery') && fullText.includes('network'))) {
    return {
      industry: 'Technology',
      market: 'Cloud Infrastructure',
      geography: 'Global',
      category: 'CDN, Security & Edge Computing',
      domain: 'Cybersecurity & Performance'
    };
  }

  return null;
};
