import { NextResponse } from 'next/server';
import { CheerioCrawler, Configuration } from 'crawlee';
import OpenAI from 'openai';

interface CampaignsRequest {
  urls: string[];
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: CampaignsRequest = await req.json();
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
        log.info(`Processing ${request.url} for Campaigns...`);
        
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
Extract the following information:
1. "campaignMessage": The core value proposition, slogan, or primary message (1 to 3 sentences).
2. "targetAudience": An object containing "description" (The specific audience or user persona they seem to be targeting) and "link" (An exact URL link, if found on the page, where more info on the target audience lives, else return null).
3. "keyFeatures": An array of objects each containing "feature" (The main feature or service) and "link" (The exact URL link to the feature page).
4. "evidenceQuote": An object containing "quote" (A direct quote from the extracted text that best supports the campaign message) and "link" (The exact URL link where verifying the quote happens).

Provide the result ONLY as a valid JSON object matching this exact interface:
{
  "campaignMessage": string,
  "targetAudience": { "description": string, "link": string | null },
  "keyFeatures": [ { "feature": string, "link": string | null } ],
  "evidenceQuote": { "quote": string, "link": string | null }
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

    const data = urls.map(url => ({
        url,
        ...(results[url] || { campaignMessage: "No data available." })
    }));

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Campaigns API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
