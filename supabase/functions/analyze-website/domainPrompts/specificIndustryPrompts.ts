import { TestPrompt } from '../types.ts';

export function generateSpecificIndustryPrompts(
  industry: string,
  market: string,
  geography: string,
  category: string,
  domain: string
): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  switch (industry) {
    case 'Enterprise Software':
      return generateEnterpriseSoftwarePrompts(market, geography, category, domain);
    
    case 'Financial Technology':
      return generateFintechPrompts(market, geography, category, domain);
    
    case 'Digital Healthcare':
      return generateHealthtechPrompts(market, geography, category, domain);
    
    case 'Consumer Electronics':
      return generateConsumerElectronicsPrompts(market, geography, category, domain);
    
    case 'Food & Beverage':
      return generateFoodBeveragePrompts(market, geography, category, domain);
    
    case 'Cybersecurity':
      return generateCybersecurityPrompts(market, geography, category, domain);
    
    case 'Cloud Infrastructure':
      return generateCloudInfrastructurePrompts(market, geography, category, domain);
    
    case 'E-commerce':
      return generateEcommercePrompts(market, geography, category, domain);
    
    default:
      return generateGenericIndustryPrompts(industry, market, geography, category, domain);
  }
}

function generateEnterpriseSoftwarePrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  if (domain === 'Accounting Software') {
    return [
      { type: "Accounting Leaders", prompt: `What are the top cloud-based accounting software solutions for businesses ${geoText}?` },
      { type: "Small Business Accounting", prompt: `Which accounting platforms are most popular among small businesses ${geoText}?` },
      { type: "Enterprise Accounting", prompt: `What are the leading enterprise accounting systems used by large corporations ${geoText}?` },
      { type: "Invoicing Solutions", prompt: `What are the best invoicing and billing software options available ${geoText}?` },
      { type: "Financial Management", prompt: `Which financial management tools do businesses prefer ${geoText}?` },
      { type: "Bookkeeping Software", prompt: `What are the most recommended bookkeeping software solutions ${geoText}?` },
      { type: "Tax Preparation", prompt: `Which business tax preparation software is most trusted ${geoText}?` }
    ];
  }
  
  if (domain === 'CRM Platforms') {
    return [
      { type: "CRM Market Leaders", prompt: `What are the top customer relationship management platforms ${geoText}?` },
      { type: "Sales CRM", prompt: `Which CRM systems are best for sales team management ${geoText}?` },
      { type: "Enterprise CRM", prompt: `What are the leading enterprise CRM solutions ${geoText}?` },
      { type: "Small Business CRM", prompt: `Which CRM platforms work best for small businesses ${geoText}?` },
      { type: "Customer Support", prompt: `What are the top customer support and service management platforms ${geoText}?` },
      { type: "Marketing Automation", prompt: `Which marketing automation and CRM platforms are most effective ${geoText}?` },
      { type: "Contact Management", prompt: `What are the best contact and lead management systems ${geoText}?` }
    ];
  }
  
  return [
    { type: "Enterprise Software", prompt: `What are the leading enterprise software solutions ${geoText}?` },
    { type: "Business Applications", prompt: `Which business application platforms dominate the ${market.toLowerCase()} market ${geoText}?` },
    { type: "Software Vendors", prompt: `Who are the top software vendors for ${domain.toLowerCase()} ${geoText}?` },
    { type: "Platform Leaders", prompt: `What platforms lead the ${category.toLowerCase()} software market ${geoText}?` },
    { type: "Technology Solutions", prompt: `Which companies provide the best ${domain.toLowerCase()} technology ${geoText}?` },
    { type: "Software Innovation", prompt: `What companies are innovating in the ${market.toLowerCase()} space ${geoText}?` },
    { type: "Market Competition", prompt: `Who are the main competitors in the ${domain.toLowerCase()} industry ${geoText}?` }
  ];
}

function generateFintechPrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  if (domain === 'Trading Platforms') {
    return [
      { type: "Trading Platforms", prompt: `What are the most popular online trading platforms ${geoText}?` },
      { type: "Brokerage Services", prompt: `Which brokerage firms offer the best trading services ${geoText}?` },
      { type: "Investment Apps", prompt: `What are the top investment and trading mobile apps ${geoText}?` },
      { type: "Retail Trading", prompt: `Which platforms are preferred by retail traders ${geoText}?` },
      { type: "Commission-Free Trading", prompt: `What are the leading commission-free trading platforms ${geoText}?` },
      { type: "Crypto Trading", prompt: `Which cryptocurrency trading platforms are most trusted ${geoText}?` },
      { type: "Options Trading", prompt: `What are the best platforms for options and derivatives trading ${geoText}?` }
    ];
  }
  
  if (domain === 'Digital Banking') {
    return [
      { type: "Digital Banks", prompt: `What are the leading digital banking platforms ${geoText}?` },
      { type: "Mobile Banking", prompt: `Which mobile banking apps are most popular ${geoText}?` },
      { type: "Neo Banks", prompt: `What are the top challenger banks and neobanks ${geoText}?` },
      { type: "Business Banking", prompt: `Which digital business banking solutions are preferred ${geoText}?` },
      { type: "Payment Solutions", prompt: `What are the leading digital payment and transfer services ${geoText}?` },
      { type: "Personal Finance", prompt: `Which personal finance management apps are most used ${geoText}?` },
      { type: "Lending Platforms", prompt: `What are the top digital lending and loan platforms ${geoText}?` }
    ];
  }
  
  return [
    { type: "Fintech Leaders", prompt: `What are the leading fintech companies ${geoText}?` },
    { type: "Financial Services", prompt: `Which companies dominate the ${market.toLowerCase()} sector ${geoText}?` },
    { type: "Payment Innovation", prompt: `What are the most innovative payment solutions ${geoText}?` },
    { type: "Digital Finance", prompt: `Which digital financial services are gaining traction ${geoText}?` },
    { type: "Banking Technology", prompt: `What companies are transforming banking technology ${geoText}?` },
    { type: "Investment Tech", prompt: `Which investment technology platforms are leading ${geoText}?` },
    { type: "Financial Apps", prompt: `What are the most successful financial apps ${geoText}?` }
  ];
}

function generateHealthtechPrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "Healthcare Technology", prompt: `What are the leading healthcare technology companies ${geoText}?` },
    { type: "Digital Health", prompt: `Which digital health platforms are most widely adopted ${geoText}?` },
    { type: "Telemedicine", prompt: `What are the top telemedicine and remote care platforms ${geoText}?` },
    { type: "Health Apps", prompt: `Which health and wellness apps are most popular ${geoText}?` },
    { type: "Medical Devices", prompt: `What companies lead in medical device innovation ${geoText}?` },
    { type: "Healthcare Software", prompt: `Which healthcare management software solutions are preferred ${geoText}?` },
    { type: "Health Analytics", prompt: `What are the leading health data and analytics platforms ${geoText}?` }
  ];
}

function generateConsumerElectronicsPrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "Electronics Brands", prompt: `What are the top consumer electronics brands ${geoText}?` },
    { type: "Smartphone Market", prompt: `Which smartphone manufacturers lead the market ${geoText}?` },
    { type: "Computing Devices", prompt: `What are the leading laptop and computer brands ${geoText}?` },
    { type: "Home Electronics", prompt: `Which companies dominate the home electronics market ${geoText}?` },
    { type: "Wearable Tech", prompt: `What are the most popular wearable technology brands ${geoText}?` },
    { type: "Gaming Hardware", prompt: `Which gaming hardware and console companies lead ${geoText}?` },
    { type: "Audio Equipment", prompt: `What are the top audio equipment and headphone brands ${geoText}?` }
  ];
}

function generateFoodBeveragePrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  if (domain === 'Beverage Brands') {
    return [
      { type: "Beverage Giants", prompt: `What are the largest beverage companies ${geoText}?` },
      { type: "Soft Drink Brands", prompt: `Which soft drink brands have the highest market share ${geoText}?` },
      { type: "Energy Drinks", prompt: `What are the leading energy drink brands ${geoText}?` },
      { type: "Water Brands", prompt: `Which bottled water companies dominate the market ${geoText}?` },
      { type: "Juice Companies", prompt: `What are the top fruit juice and beverage companies ${geoText}?` },
      { type: "Coffee Brands", prompt: `Which coffee and café chains are most popular ${geoText}?` },
      { type: "Alcoholic Beverages", prompt: `What are the leading alcoholic beverage companies ${geoText}?` }
    ];
  }
  
  return [
    { type: "Food Companies", prompt: `What are the largest food and beverage companies ${geoText}?` },
    { type: "Consumer Brands", prompt: `Which consumer packaged goods companies lead ${geoText}?` },
    { type: "Restaurant Chains", prompt: `What are the most successful restaurant and food chains ${geoText}?` },
    { type: "Food Innovation", prompt: `Which companies are innovating in food technology ${geoText}?` },
    { type: "Grocery Brands", prompt: `What are the top grocery and food retail brands ${geoText}?` },
    { type: "Snack Foods", prompt: `Which snack food companies have the largest market presence ${geoText}?` },
    { type: "Organic Foods", prompt: `What are the leading organic and health food brands ${geoText}?` }
  ];
}

function generateCybersecurityPrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "Security Leaders", prompt: `What are the top cybersecurity companies ${geoText}?` },
    { type: "Enterprise Security", prompt: `Which enterprise security solutions are most trusted ${geoText}?` },
    { type: "Cloud Security", prompt: `What are the leading cloud security platforms ${geoText}?` },
    { type: "Endpoint Protection", prompt: `Which endpoint protection and antivirus companies lead ${geoText}?` },
    { type: "Network Security", prompt: `What are the top network security and firewall solutions ${geoText}?` },
    { type: "Identity Management", prompt: `Which identity and access management solutions are preferred ${geoText}?` },
    { type: "Threat Intelligence", prompt: `What are the leading threat detection and intelligence platforms ${geoText}?` }
  ];
}

function generateCloudInfrastructurePrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "Cloud Providers", prompt: `What are the leading cloud infrastructure providers ${geoText}?` },
    { type: "Cloud Platforms", prompt: `Which cloud computing platforms dominate the market ${geoText}?` },
    { type: "Cloud Services", prompt: `What are the top cloud service and hosting companies ${geoText}?` },
    { type: "DevOps Tools", prompt: `Which DevOps and cloud management tools are most popular ${geoText}?` },
    { type: "Container Platforms", prompt: `What are the leading container and orchestration platforms ${geoText}?` },
    { type: "Serverless Computing", prompt: `Which serverless and function-as-a-service platforms lead ${geoText}?` },
    { type: "Cloud Storage", prompt: `What are the top cloud storage and backup solutions ${geoText}?` }
  ];
}

function generateEcommercePrompts(market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "E-commerce Giants", prompt: `What are the largest e-commerce platforms ${geoText}?` },
    { type: "Online Marketplaces", prompt: `Which online marketplaces have the most traffic ${geoText}?` },
    { type: "E-commerce Software", prompt: `What are the leading e-commerce platform solutions ${geoText}?` },
    { type: "Online Retail", prompt: `Which online retailers dominate their respective markets ${geoText}?` },
    { type: "Payment Gateways", prompt: `What are the most trusted e-commerce payment solutions ${geoText}?` },
    { type: "Shipping Services", prompt: `Which logistics and shipping companies serve e-commerce best ${geoText}?` },
    { type: "Digital Commerce", prompt: `What are the top digital commerce and sales platforms ${geoText}?` }
  ];
}

function generateGenericIndustryPrompts(industry: string, market: string, geography: string, category: string, domain: string): TestPrompt[] {
  const geoText = geography === 'Global' ? 'globally' : `in ${geography}`;
  
  return [
    { type: "Industry Leaders", prompt: `What are the leading companies in the ${industry.toLowerCase()} industry ${geoText}?` },
    { type: "Market Dominance", prompt: `Which companies dominate the ${market.toLowerCase()} market ${geoText}?` },
    { type: "Sector Analysis", prompt: `What are the top companies in the ${domain.toLowerCase()} sector ${geoText}?` },
    { type: "Business Solutions", prompt: `Which companies provide the best ${domain.toLowerCase()} solutions ${geoText}?` },
    { type: "Innovation Leaders", prompt: `What companies are leading innovation in ${industry.toLowerCase()} ${geoText}?` },
    { type: "Service Providers", prompt: `Who are the top service providers in the ${market.toLowerCase()} space ${geoText}?` },
    { type: "Competitive Landscape", prompt: `What companies compete in the ${domain.toLowerCase()} market ${geoText}?` }
  ];
}