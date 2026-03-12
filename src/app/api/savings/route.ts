import { NextResponse } from 'next/server';
import { PlaywrightCrawler, Configuration } from 'crawlee';
import OpenAI from 'openai';

interface SavingsRequest {
  urls: string[];
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: SavingsRequest = await req.json();
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
      requestHandlerTimeoutSecs: 120, // Increased for heavy enterprise sites
      launchContext: {
          launchOptions: {
              headless: true,
              viewport: { width: 1440, height: 900 }, // Slightly smaller for better performance
          },
      },
      browserPoolOptions: {
          useFingerprints: true,
      },
      async requestHandler({ request, page, log }) {
        log.info(`Processing ${request.url} with Global Stealth Scraper...`);
        
        // 1. Bot Masking: Hide 'navigator.webdriver' to avoid primitive bot blocks
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        // 2. Set realistic headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        // 3. Navigate with generous timeout
        try {
            await page.goto(request.url, { waitUntil: 'load', timeout: 60000 });
        } catch (e) {
            log.warning(`Load timeout on ${request.url}, proceeding anyway...`);
        }

        // 4. Robust Cookie Banner Handling
        // We look for common patterns and keyword-based buttons
        log.info(`Checking for cookie banners on ${request.url}...`);
        await page.waitForTimeout(3000); // Wait for banners to pop up

        const cookieSelectors = [
            '#onetrust-accept-btn-handler', // OneTrust
            '#hp-consent-accept-all',       // HP
            '#truste-consent-button',      // TrustArc
            '[id*="accept-all"]',
            '[class*="accept-all"]',
            '.all-cookies-btn',
            'button:has-text("Accept All")',
            'button:has-text("Accept all")',
            'button:has-text("Accept Cookies")',
            'button:has-text("Accept cookies")',
            'button:has-text("Allow All")',
            'button:has-text("I Accept")',
            'button:has-text("Agree")',
            '[aria-label*="Accept all cookies"]'
        ];

        for (const selector of cookieSelectors) {
            try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    await btn.click({ timeout: 2000 });
                    log.info(`Clicked cookie button [${selector}] on ${request.url}`);
                    await page.waitForTimeout(2000); // Wait for overlay to disappear
                }
            } catch (e) {}
        }

        // 5. Trigger Layout / Lazy Load
        await page.evaluate(() => {
            window.scrollBy(0, 800);
            return new Promise(r => setTimeout(r, 1000));
        });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);

        const screenshots: string[] = [];
        
        // 6. Capture Hero / Carousel Screenshots
        const nextButtonSelectors = [
            '.slick-next', 
            '.swiper-button-next', 
            '.carousel-control-next', 
            '.carousel__button--next',
            '[aria-label*="Next"]',
            '[aria-label*="next"]',
            '.hp-hero-next',
            '.acer-carousel-next', // Custom guess for Acer
            '.next-arrow'
        ];

        // Initial Shot
        const initialShot = await page.screenshot({ fullPage: false, type: 'png' });
        screenshots.push(initialShot.toString('base64'));

        // Try to find a carousel button
        let foundBtn = null;
        for (const selector of nextButtonSelectors) {
            try {
                const el = page.locator(selector).first();
                if (await el.isVisible()) {
                    foundBtn = el;
                    break;
                }
            } catch (e) {}
        }

        if (foundBtn) {
            log.info(`Found carousel button on ${request.url}. Capturing slides...`);
            for (let i = 0; i < 3; i++) {
                try {
                    await foundBtn.click({ timeout: 2000 });
                    await page.waitForTimeout(1500); 
                    const shot = await page.screenshot({ fullPage: false, type: 'png' });
                    screenshots.push(shot.toString('base64'));
                } catch (e) {
                    break;
                }
            }
        }

        // 7. Extract Content for AI
        const bodyContent = await page.innerText('body');
        const cleanedText = bodyContent.replace(/\s+/g, ' ').trim().slice(0, 20000);

        try {
            const prompt = `You are an expert promotional analyst. 
Analyze the following text from ${request.url}. 
Extract all "Highest Savings", clearance, student discounts, or major promotional deals.
Look for: "Save up to", "Off", "Back to School", "Clearance".

Return ONLY JSON:
{
  "savings": [
    {
       "discountType": "Percentage" | "Fixed Amount" | "Tiered",
       "targetAudience": string,
       "location": "Hero" | "Deals Section" | "Banner",
       "description": string
    }
  ]
}

Text:
${cleanedText}`;

            const res = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });

            const content = res.choices[0]?.message?.content;
            if (content) {
                 const parsed = JSON.parse(content);
                 results[request.url] = {
                     savings: parsed.savings || [],
                     screenshots
                 };
            }
        } catch (e) {
             results[request.url] = { savings: [], screenshots };
        }
      },
    }, config);

    await crawler.run(urls);

    const data = urls.map(url => ({
        url,
        ...(results[url] || { savings: [], screenshots: [] })
    }));

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Savings API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
