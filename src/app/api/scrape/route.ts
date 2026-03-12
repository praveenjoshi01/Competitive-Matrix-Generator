import { NextResponse } from 'next/server';
import { CheerioCrawler, Configuration } from 'crawlee';
import OpenAI from 'openai';

interface ScrapeRequest {
  urls: string[];
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: ScrapeRequest = await req.json();
    const { urls, apiKey } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid urls array' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing apiKey' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // Store results
    const results: Record<string, any> = {};

    // For serverless environments like Next.js API routes, it's safer to configure Crawlee
    // to keep storage in memory rather than on disk to avoid write permission issues and leaks.
    const config = new Configuration({
      purgeOnStart: true,
      persistStorage: false, // very important for Next.js api routes
    });

    const crawler = new CheerioCrawler({
      // We only want to process the initial requests, not follow links
      maxRequestsPerCrawl: urls.length,
      async requestHandler({ request, $, log }) {
        log.info(`Processing ${request.url}...`);
        
        // Extract main text content, ignoring scripts and styles
        $('script, style, noscript, iframe').remove();
        
        // Inject hrefs into anchor text so OpenAI can see them in the plaintext
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                try {
                    const absoluteUrl = new URL(href, request.url).href;
                    $(el).append(` [Link: ${absoluteUrl}] `);
                } catch (e) {
                    // Ignore invalid URLs
                }
            }
        });

        const textContent = $('body').text().replace(/\s+/g, ' ').trim();
        
        // Take an excerpt to avoid hitting OpenAI token limits completely if the page is huge
        const excerpt = textContent.slice(0, 15000); 
        
        try {
            const prompt = `You are an expert marketing analyst.
Analyze the following text extracted from the homepage of a company's website (${request.url}).
Extract the following information to build a competitive matrix:
1. "campaignMessage": The core value proposition, slogan, or primary message (1 to 3 sentences).
2. "targetAudience": An object containing "description" (The specific audience or user persona they seem to be targeting) and "link" (An exact URL link, if found on the page, where more info on the target audience lives, else return null).
3. "keyFeatures": An array of objects each containing "feature" (The main feature or service) and "link" (The exact URL link to the feature page).
4. "evidenceQuote": An object containing "quote" (A direct quote from the extracted text that best supports the campaign message) and "link" (The exact URL link where verifying the quote happens, or just return the main URL if no specific subpage is mentioned).
5. "urgencyAndClaims": An array of objects each containing:
   - "text": The specific phrase extracted (e.g., "Limited time offer" or "#1 rated platform").
   - "category": Categorize as exactly one of: "Urgency" (for time pressure/scarcity), "Claim" (for bold assertions/stats/credibility), or "Both" (if it combines both).
   - "link": The exact URL link where this appears.

Provide the result ONLY as a valid JSON object matching this exact interface:
{
  "campaignMessage": string,
  "targetAudience": { "description": string, "link": string | null },
  "keyFeatures": [ { "feature": string, "link": string | null } ],
  "evidenceQuote": { "quote": string, "link": string | null },
  "urgencyAndClaims": [ { "text": string, "category": string, "link": string | null } ]
}

Extracted Text:
${excerpt}`;

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (content) {
                 results[request.url] = JSON.parse(content);
            } else {
                 results[request.url] = { campaignMessage: "No message extracted." };
            }
        } catch (openaiError: any) {
             log.error(`OpenAI error for ${request.url}:`, openaiError);
             results[request.url] = { campaignMessage: `Error extracting message: ${openaiError.message}` };
        }
      },
      failedRequestHandler({ request, log }) {
        log.error(`Request ${request.url} failed completely.`);
        results[request.url] = { campaignMessage: "Failed to scrape website." };
      },
    }, config);

    await crawler.run(urls);

    // Format the returning matrix order based on original urls input
    const matrix = urls.map(url => ({
        url,
        ...(results[url] || { campaignMessage: "No data available." })
    }));

    return NextResponse.json({ matrix });

  } catch (error: any) {
    console.error('Scrape API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
