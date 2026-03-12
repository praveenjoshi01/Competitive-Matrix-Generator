import { NextResponse } from 'next/server';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import OpenAI from 'openai';

interface ShippingRequest {
  urls: string[];
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: ShippingRequest = await req.json();
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

    const crawler = new PlaywrightCrawler({
      maxRequestsPerCrawl: urls.length,
      requestHandlerTimeoutSecs: 120,
      launchContext: {
        launchOptions: {
          headless: true,
          viewport: { width: 1440, height: 900 },
        },
      },
      browserPoolOptions: {
        useFingerprints: true,
      },
      async requestHandler({ request, page, log }) {
        log.info(`Searching for shipping info on ${request.url}...`);
        
        // Bot Masking
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        await page.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        // 1. Initial homepage load
        try {
          await page.goto(request.url, { waitUntil: 'load', timeout: 45000 });
        } catch (e) {
          log.warning(`Load timeout on ${request.url}, continuing...`);
        }

        // Handle cookies
        await page.waitForTimeout(2000);
        const cookieBtns = ['button:has-text("Accept All")', 'button:has-text("Accept all")', 'button:has-text("Accept Cookies")', 'button:has-text("Allow All")'];
        for (const sel of cookieBtns) {
          try {
            const btn = page.locator(sel).first();
            if (await btn.isVisible()) {
              await btn.click({ timeout: 2000 });
              await page.waitForTimeout(1000);
            }
          } catch (e) {}
        }

        // 2. Discover Shipping Page
        log.info(`Starting page discovery for ${request.url}`);
        let targetUrl = request.url;
        
        const shippingKeywords = ['shipping', 'delivery', 'shipping help', 'shipping information', 'delivery info'];
        let shippingLinkFound = false;

        // Search for relevant links in footer/nav
        const links = await page.locator('a').all();
        for (const link of links) {
          const text = (await link.innerText()).toLowerCase();
          const href = await link.getAttribute('href');
          
          if (href && shippingKeywords.some(kw => text.includes(kw))) {
            const absoluteUrl = new URL(href, request.url).href;
            log.info(`Found potential shipping link: ${text} -> ${absoluteUrl}`);
            
            try {
              await page.goto(absoluteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
              targetUrl = absoluteUrl;
              shippingLinkFound = true;
              break;
            } catch (e) {
              log.warning(`Failed to navigate to ${absoluteUrl}`);
            }
          }
        }

        // Fallback to common paths if no link found
        if (!shippingLinkFound) {
          const commonPaths = ['/shipping-policy', '/delivery', '/help/shipping'];
          for (const path of commonPaths) {
            const fallbackUrl = new URL(path, request.url).href;
            try {
              const res = await page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
              if (res?.status() === 200) {
                log.info(`Found shipping info at common path: ${fallbackUrl}`);
                targetUrl = fallbackUrl;
                shippingLinkFound = true;
                break;
              }
            } catch (e) {}
          }
        }

        // 3. Extract text
        const textContent = await page.innerText('body');
        const excerpt = textContent.replace(/\s+/g, ' ').trim().slice(0, 20000);

        // 4. AI Analysis
        try {
          const prompt = `You are an expert logistics and logistics researcher.
Analyze the following text from ${targetUrl} and extract shipping and delivery details.

Fields to extract:
1. "freeShippingAvailable": true or false.
2. "freeShippingThreshold": The minimum spend for free shipping (e.g., "$35", "No minimum").
3. "twoDayDelivery": Summary of 2-day delivery offers.
4. "sameDayDelivery": Summary of same-day delivery availability.
5. "storePickup": Summary of in-store pickup options (e.g., "Free").
6. "storeDeliveryFee": Fee for delivery from store.
7. "additionalNotes": Any special requirements (e.g., "Members only").

Text to analyze:
${excerpt}

Return ONLY a JSON object:
{
  "freeShippingAvailable": boolean,
  "freeShippingThreshold": string,
  "twoDayDelivery": string,
  "sameDayDelivery": string,
  "storePickup": string,
  "storeDeliveryFee": string,
  "additionalNotes": string
}`;

          const res = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0,
          });

          const content = res.choices[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            results[request.url] = {
              ...parsed,
              sourceUrl: targetUrl
            };
          }
        } catch (e) {
          log.error(`AI analysis failed for ${request.url}: ${e}`);
          results[request.url] = { error: 'Failed to analyze shipping info' };
        }
      }
    }, config);

    await crawler.run(urls);

    const data = urls.map(url => ({
      url,
      ...(results[url] || { error: 'No data found' })
    }));

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Shipping API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
