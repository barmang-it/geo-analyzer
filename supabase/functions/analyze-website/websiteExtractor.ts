
interface WebsiteContent {
  title: string;
  description: string;
  content: string;
  hasStructuredData: boolean;
}

export async function extractWebsiteContent(url: string): Promise<WebsiteContent> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2s

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CiteMe-Bot/1.0)'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    // More efficient extraction with single pass
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ''
    
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : ''
    
    // More efficient content extraction - target main content areas first
    let textContent = '';
    const mainMatches = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    
    if (mainMatches) {
      textContent = mainMatches[1];
    } else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      textContent = bodyMatch ? bodyMatch[1] : html;
    }
    
    // Efficient cleanup
    textContent = textContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Remove navigation
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Remove footer
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 800) // Further reduced for speed
    
    // Quick structured data check
    const hasStructuredData = html.includes('application/ld+json') || 
                              html.includes('schema.org') ||
                              html.includes('microdata')
    
    return {
      title,
      description,
      content: textContent,
      hasStructuredData
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Website extraction error:', error)
    return {
      title: '',
      description: '',
      content: '',
      hasStructuredData: false
    }
  }
}
