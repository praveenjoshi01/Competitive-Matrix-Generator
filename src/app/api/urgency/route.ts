import { NextResponse } from 'next/server';
import { CheerioCrawler, Configuration } from 'crawlee';
import OpenAI from 'openai';

interface UrgencyRequest {
  urls: string[];
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: UrgencyRequest = await req.json();
    const { urls, apiKey } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid urls array' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing apiKey' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const results: Record<string, any> = {};

    const config = new Configuration({
      purgeOnStart: true,
      persistStorage: false,
    });

    const crawler = new CheerioCrawler({
      maxRequestsPerCrawl: urls.length,
      async requestHandler({ request, $, log }) {
        log.info(`Processing ${request.url} for Urgency & Claims...`);
        
        $('script, style, noscript, iframe').remove();
        
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                try {
                    const absoluteUrl = new URL(href, request.url).href;
                    $(el).append(` [Link: ${absoluteUrl}] `);
                } catch (e) {}
            }
        });

        const textContent = $('body').text().replace(/\s+/g, ' ').trim();
        const excerpt = textContent.slice(0, 15000); 
        
        try {
            const prompt = `You are an expert marketing analyst.
Analyze the following text extracted from the homepage of a company's website (${request.url}).
Identify all "Urgency & Claims": Specific persuasive language and assertions.

Extract an array called "urgencyAndClaims" where each object contains:
- "text": The specific phrase extracted (e.g., "Limited time offer", "50% off today only", or "The world's most trusted CRM").
- "category": Categorize as exactly one of: "Urgency" (for time pressure/scarcity), "Claim" (for bold assertions/stats/credibility), or "Both" (if it combines both).
- "link": The exact URL link where this appears or the main URL if it's general.

Provide the result ONLY as a valid JSON object matching this exact interface:
{
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
                 results[request.url] = { urgencyAndClaims: [] };
            }
        } catch (openaiError: any) {
             log.error(`OpenAI error for ${request.url}:`, openaiError);
             results[request.url] = { urgencyAndClaims: [] };
        }
      },
      failedRequestHandler({ request, log }) {
        log.error(`Request ${request.url} failed completely.`);
        results[request.url] = { urgencyAndClaims: [] };
      },
    }, config);

    await crawler.run(urls);

    const data = urls.map(url => ({
        url,
        ...(results[url] || { urgencyAndClaims: [] })
    }));

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Urgency API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
