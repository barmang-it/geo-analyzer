
import { BusinessClassification } from '../types';
import { extractGeographyHints } from '../geographyExtractor';

export const performIntelligentClassification = (
  businessName: string,
  websiteUrl: string,
  websiteContent?: string
): BusinessClassification => {
  const fullText = `${businessName} ${websiteUrl} ${websiteContent || ''}`.toLowerCase();
  
  // Extract geography intelligently
  const geography = extractGeographyHints(businessName, websiteUrl, websiteContent);
  
  // More granular industry classification with specific tech subcategories
  const industryKeywords = {
    'CDN & Edge Computing': [
      'content delivery network', 'cdn', 'edge computing', 'edge servers',
      'content acceleration', 'web performance', 'akamai', 'cloudflare',
      'global delivery', 'edge infrastructure', 'performance optimization',
      'web acceleration', 'ddos protection', 'edge security'
    ],
    'Enterprise Software': [
      'enterprise software', 'business software', 'crm', 'erp', 'hr software',
      'accounting software', 'project management', 'business intelligence',
      'workflow', 'automation', 'saas', 'productivity'
    ],
    'Database & Analytics': [
      'database', 'data warehouse', 'big data', 'analytics platform',
      'business intelligence', 'data management', 'mongodb', 'oracle',
      'sql', 'nosql', 'data science', 'etl', 'data pipeline'
    ],
    'Developer Tools': [
      'developer tools', 'api management', 'version control', 'ci/cd',
      'code repository', 'github', 'gitlab', 'devops platform',
      'testing tools', 'monitoring tools', 'observability'
    ],
    'Financial Technology': [
      'fintech', 'digital banking', 'mobile banking', 'trading platform',
      'payment processing', 'cryptocurrency', 'blockchain', 'robo advisor',
      'lending platform', 'neobank', 'digital wallet'
    ],
    'Digital Healthcare': [
      'healthtech', 'telemedicine', 'digital health', 'health app',
      'medical device', 'electronic health records', 'health analytics',
      'remote monitoring', 'digital therapeutics'
    ],
    'Consumer Electronics': [
      'smartphone', 'laptop', 'tablet', 'gaming', 'wearables',
      'smart home', 'audio equipment', 'electronics', 'hardware',
      'mobile devices', 'consumer technology'
    ],
    'Automotive Technology': [
      'electric vehicle', 'autonomous driving', 'automotive software',
      'connected car', 'mobility', 'transportation technology',
      'vehicle manufacturing', 'ev charging'
    ],
    'Food & Beverage': [
      'beverage company', 'soft drinks', 'energy drinks', 'juice',
      'water', 'soda', 'coffee', 'food brand', 'restaurant chain',
      'consumer packaged goods', 'snacks'
    ],
    'Energy & Utilities': [
      'renewable energy', 'solar', 'wind', 'utilities', 'power',
      'electricity', 'energy storage', 'grid', 'oil', 'gas'
    ],
    'E-commerce': [
      'online marketplace', 'e-commerce platform', 'online retail',
      'digital commerce', 'marketplace', 'online shopping',
      'e-commerce software', 'dropshipping'
    ],
    'Cybersecurity': [
      'cybersecurity', 'security software', 'endpoint protection',
      'network security', 'threat detection', 'identity management',
      'security platform', 'firewall', 'antivirus'
    ],
    'Cloud Infrastructure': [
      'cloud computing', 'cloud platform', 'infrastructure as a service',
      'platform as a service', 'cloud hosting', 'serverless',
      'container', 'devops', 'cloud storage'
    ],
    'AI & Machine Learning': [
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural networks', 'computer vision', 'natural language processing',
      'ai platform', 'ml platform'
    ],
    'Network Infrastructure': [
      'network infrastructure', 'internet backbone', 'fiber optic',
      'telecommunications', 'isp', 'internet service provider',
      'networking equipment', 'routers', 'switches'
    ]
  };
  
  // Calculate industry scores
  let bestIndustry = 'Enterprise Software';
  let maxMatches = 0;
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    const matches = keywords.filter(keyword => fullText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestIndustry = industry;
    }
  }
  
  // More specific market classification
  const getMarket = (industry: string): string => {
    switch (industry) {
      case 'CDN & Edge Computing':
        if (fullText.includes('ddos') || fullText.includes('security')) return 'Edge Security';
        if (fullText.includes('performance') || fullText.includes('acceleration')) return 'Web Performance';
        if (fullText.includes('streaming') || fullText.includes('video')) return 'Media Delivery';
        return 'Content Delivery';
      case 'Enterprise Software':
        if (fullText.includes('accounting') || fullText.includes('invoice')) return 'Accounting Software';
        if (fullText.includes('crm') || fullText.includes('customer')) return 'Customer Relationship Management';
        if (fullText.includes('hr') || fullText.includes('human resources')) return 'Human Resources';
        if (fullText.includes('project') || fullText.includes('collaboration')) return 'Project Management';
        return 'SaaS Tools';
      case 'Database & Analytics':
        if (fullText.includes('warehouse') || fullText.includes('big data')) return 'Data Warehousing';
        if (fullText.includes('analytics') || fullText.includes('intelligence')) return 'Business Intelligence';
        if (fullText.includes('mongodb') || fullText.includes('nosql')) return 'NoSQL Databases';
        return 'Database Management';
      case 'Developer Tools':
        if (fullText.includes('api') || fullText.includes('integration')) return 'API Management';
        if (fullText.includes('version control') || fullText.includes('git')) return 'Version Control';
        if (fullText.includes('monitoring') || fullText.includes('observability')) return 'Application Monitoring';
        return 'Development Platforms';
      case 'Financial Technology':
        if (fullText.includes('trading') || fullText.includes('investment')) return 'Trading Platforms';
        if (fullText.includes('banking') || fullText.includes('neobank')) return 'Digital Banking';
        if (fullText.includes('payment') || fullText.includes('transfer')) return 'Payment Processing';
        if (fullText.includes('lending') || fullText.includes('loan')) return 'Digital Lending';
        return 'Financial Services';
      case 'Digital Healthcare':
        if (fullText.includes('telemedicine') || fullText.includes('telehealth')) return 'Telemedicine';
        if (fullText.includes('device') || fullText.includes('monitoring')) return 'Medical Devices';
        if (fullText.includes('records') || fullText.includes('ehr')) return 'Health Records';
        return 'Digital Health';
      case 'Consumer Electronics':
        if (fullText.includes('mobile') || fullText.includes('smartphone')) return 'Mobile Devices';
        if (fullText.includes('computer') || fullText.includes('laptop')) return 'Computing Hardware';
        if (fullText.includes('gaming') || fullText.includes('console')) return 'Gaming Hardware';
        return 'Consumer Technology';
      case 'Food & Beverage':
        if (fullText.includes('beverage') || fullText.includes('drink')) return 'Beverage Products';
        if (fullText.includes('restaurant') || fullText.includes('food service')) return 'Food Service';
        return 'Consumer Food Products';
      case 'Cybersecurity':
        if (fullText.includes('endpoint') || fullText.includes('antivirus')) return 'Endpoint Security';
        if (fullText.includes('network') || fullText.includes('firewall')) return 'Network Security';
        if (fullText.includes('cloud security')) return 'Cloud Security';
        return 'Cybersecurity Solutions';
      case 'Cloud Infrastructure':
        if (fullText.includes('hosting') || fullText.includes('server')) return 'Cloud Hosting';
        if (fullText.includes('platform') || fullText.includes('paas')) return 'Platform as a Service';
        if (fullText.includes('infrastructure')) return 'Infrastructure as a Service';
        return 'Cloud Services';
      case 'Network Infrastructure':
        if (fullText.includes('fiber') || fullText.includes('backbone')) return 'Internet Backbone';
        if (fullText.includes('isp') || fullText.includes('internet service')) return 'Internet Service Provider';
        if (fullText.includes('equipment') || fullText.includes('hardware')) return 'Networking Equipment';
        return 'Network Services';
      case 'E-commerce':
        if (fullText.includes('marketplace') || fullText.includes('platform')) return 'Marketplace Platforms';
        if (fullText.includes('retail') || fullText.includes('shopping')) return 'Online Retail';
        return 'E-commerce Solutions';
      default:
        return 'Other';
    }
  };
  
  // More specific category classification based on company size and public status
  const getCategory = (industry: string, geography: string): string => {
    // Check for Fortune 500 indicators
    const fortune500Keywords = ['fortune 500', 'fortune500', 'largest companies', 'major corporation'];
    if (fortune500Keywords.some(keyword => fullText.includes(keyword))) return 'Fortune 500';
    
    // Check for public company indicators
    const publicCompanyKeywords = ['nasdaq', 'nyse', 'stock exchange', 'publicly traded', 'ticker symbol', 'shares'];
    if (publicCompanyKeywords.some(keyword => fullText.includes(keyword))) return 'Public Company';
    
    // Check for unicorn startup indicators
    const unicornKeywords = ['unicorn', 'billion valuation', 'startup valued'];
    if (unicornKeywords.some(keyword => fullText.includes(keyword))) return 'Unicorn Startup';
    
    // Global companies are typically larger
    if (geography === 'Global') {
      return fullText.includes('startup') ? 'Unicorn Startup' : 'Public Company';
    }
    
    // Size-based determination
    if (fullText.includes('enterprise') || fullText.includes('large corporation')) return 'Public Company';
    if (fullText.includes('startup') || fullText.includes('founded')) return 'Unicorn Startup';
    if (fullText.includes('small business') || fullText.includes('local')) return 'Small Business';
    
    return 'Mid-Market';
  };
  
  // More specific domain classification aligned with market
  const getDomain = (industry: string, market: string): string => {
    // Direct mapping from market to domain for specificity
    switch (market) {
      // CDN & Edge Computing domains
      case 'Content Delivery': return 'CDN Services';
      case 'Edge Security': return 'Edge Security';
      case 'Web Performance': return 'Performance Optimization';
      case 'Media Delivery': return 'Media CDN';
      
      // Enterprise Software domains
      case 'Accounting Software': return 'Accounting Software';
      case 'Customer Relationship Management': return 'CRM Platforms';
      case 'Human Resources': return 'HR Software';
      case 'Project Management': return 'Project Management';
      
      // Database & Analytics domains
      case 'Data Warehousing': return 'Data Warehousing';
      case 'Business Intelligence': return 'BI Platforms';
      case 'NoSQL Databases': return 'NoSQL Databases';
      case 'Database Management': return 'Database Solutions';
      
      // Developer Tools domains
      case 'API Management': return 'API Platforms';
      case 'Version Control': return 'Code Management';
      case 'Application Monitoring': return 'DevOps Tools';
      case 'Development Platforms': return 'Developer Platforms';
      
      // Financial Technology domains
      case 'Trading Platforms': return 'Trading Platforms';
      case 'Digital Banking': return 'Digital Banking';
      case 'Payment Processing': return 'Payment Solutions';
      case 'Digital Lending': return 'Lending Platforms';
      
      // Other existing domains
      case 'Telemedicine': return 'Telemedicine Platforms';
      case 'Medical Devices': return 'Medical Devices';
      case 'Mobile Devices': return 'Mobile Devices';
      case 'Computing Hardware': return 'Computing Hardware';
      case 'Beverage Products': return 'Beverage Brands';
      case 'Food Service': return 'Food Service';
      case 'Endpoint Security': return 'Security Solutions';
      case 'Network Security': return 'Security Solutions';
      case 'Cloud Security': return 'Security Solutions';
      case 'Cloud Hosting': return 'Cloud Infrastructure';
      case 'Platform as a Service': return 'Cloud Infrastructure';
      case 'Infrastructure as a Service': return 'Cloud Infrastructure';
      case 'Internet Backbone': return 'Network Infrastructure';
      case 'Internet Service Provider': return 'ISP Services';
      case 'Networking Equipment': return 'Network Hardware';
      case 'Marketplace Platforms': return 'Marketplace Platforms';
      case 'Online Retail': return 'E-commerce Platforms';
      
      default:
        // Fallback to industry-based domain
        switch (industry) {
          case 'CDN & Edge Computing': return 'CDN Services';
          case 'Enterprise Software': return 'SaaS Tools';
          case 'Database & Analytics': return 'Data Solutions';
          case 'Developer Tools': return 'Developer Tools';
          case 'Financial Technology': return 'Fintech Solutions';
          case 'Digital Healthcare': return 'Digital Health';
          case 'Consumer Electronics': return 'Consumer Technology';
          case 'Food & Beverage': return 'Consumer Products';
          case 'Cybersecurity': return 'Security Solutions';
          case 'Cloud Infrastructure': return 'Cloud Infrastructure';
          case 'Network Infrastructure': return 'Network Services';
          case 'E-commerce': return 'E-commerce Platforms';
          default: return 'Other';
        }
    }
  };
  
  const market = getMarket(bestIndustry);
  const category = getCategory(bestIndustry, geography);
  const domain = getDomain(bestIndustry, market);
  
  return {
    industry: bestIndustry,
    market,
    geography,
    category,
    domain
  };
};
