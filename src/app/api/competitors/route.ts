import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface CompetitorRequest {
  company: string;
  location: string;
  apiKey: string;
}

export async function POST(req: Request) {
  try {
    const body: CompetitorRequest = await req.json();
    const { company, location, apiKey } = body;

    if (!company || !location || !apiKey) {
      return NextResponse.json(
        { error: 'Missing company, location, or API key' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a business research assistant helping to build a competitive matrix.
Find 5 main competitors for the company "${company}" operating in "${location}".
For each competitor, provide their name and their main website URL.
Return the result strictly as a JSON array of objects, where each object has "name" and "url" properties.
Example format:
[
  { "name": "Competitor 1", "url": "https://competitor1.com" },
  { "name": "Competitor 2", "url": "https://competitor2.com" }
]
Do not include markdown blocks or any other text in your response, just the raw JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    let competitors;
    try {
        // Attempt to parse the response, removing any potential markdown code block wrappers
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        competitors = JSON.parse(cleanedContent);
    } catch (parseError) {
        console.error("Failed to parse OpenAI response:", content);
         return NextResponse.json(
            { error: 'Failed to parse AI response into JSON format.' },
            { status: 500 }
        );
    }

    return NextResponse.json({ competitors });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
