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
1. Find the main official website URL for the company "${company}".
2. Find 5 main competitors for "${company}" operating in "${location}". For each competitor, provide their name and their main website URL.

Return the result strictly as a JSON object with two properties:
- "baseCompanyUrl": The URL of "${company}".
- "competitors": A JSON array of objects, where each object has "name" and "url" properties.

Example format:
{
  "baseCompanyUrl": "https://basecompany.com",
  "competitors": [
    { "name": "Competitor 1", "url": "https://competitor1.com" },
    { "name": "Competitor 2", "url": "https://competitor2.com" }
  ]
}
Do not include markdown blocks or any other text in your response, just the raw JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
        throw new Error("No response from OpenAI");
    }

    let data;
    try {
        data = JSON.parse(content);
    } catch (parseError) {
        console.error("Failed to parse OpenAI response:", content);
         return NextResponse.json(
            { error: 'Failed to parse AI response into JSON format.' },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
