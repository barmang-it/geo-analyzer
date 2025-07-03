
import { BusinessClassification } from '../types';

export const classifyConglomerate = (fullText: string): BusinessClassification | null => {
  // Enhanced conglomerate detection
  const conglomerateKeywords = ['holdings', 'group', 'corporation', 'industries', 'conglomerate', 'diversified'];
  const isConglomerate = conglomerateKeywords.some(keyword => fullText.includes(keyword));
  
  // Major conglomerates with specific classification
  if (fullText.includes('reliance') && (fullText.includes('industries') || fullText.includes('ril'))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Petrochemicals, Retail & Telecom',
      domain: 'Diversified Conglomerate'
    };
  }
  
  if (fullText.includes('berkshire') && fullText.includes('hathaway')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Insurance, Energy & Consumer Goods',
      domain: 'Investment Conglomerate'
    };
  }
  
  if (fullText.includes('general') && fullText.includes('electric')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Energy, Healthcare & Aviation',
      domain: 'Industrial Conglomerate'
    };
  }
  
  if (fullText.includes('samsung') && !fullText.includes('electronics')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Electronics, Heavy Industries & Financial Services',
      domain: 'Technology Conglomerate'
    };
  }
  
  if (fullText.includes('siemens')) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Industrial Automation, Energy & Healthcare',
      domain: 'Industrial Technology Conglomerate'
    };
  }
  
  if (fullText.includes('tata') && (fullText.includes('group') || fullText.includes('sons'))) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'Global',
      category: 'Steel, Automotive, IT Services & Consumer Goods',
      domain: 'Diversified Business Group'
    };
  }
  
  // Generic conglomerate detection
  if (isConglomerate) {
    return {
      industry: 'Conglomerate',
      market: 'Multi-Industry',
      geography: 'US',
      category: 'Diversified Holdings',
      domain: 'Business Conglomerate'
    };
  }

  return null;
};
