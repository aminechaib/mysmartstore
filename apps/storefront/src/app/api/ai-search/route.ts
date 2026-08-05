// File: apps/storefront/src/app/api/ai-search/route.ts
// --- PART 2 (Frontend API) ---

import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

const SYSTEM_PROMPT = `You are the exclusive personal shopping assistant for OUR premium e-commerce store. 
CRITICAL RULES:
1. NEVER suggest other websites, brands, or platforms (like Amazon, eBay, etc.).
2. Always assume we have what the customer is looking for in our catalog.
3. Analyze their request, extract the key details (color, style, price), and enthusiastically tell them you are preparing those exact items from our collection.
4. Keep your response under 3 sentences. Be friendly, modern, and professional.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userQuery = body.query;

    if (!userQuery) {
      return NextResponse.json({ error: "Please provide a search query." }, { status: 400 });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery }
    ];

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: messages as any,
    });

    const aiMessage = chatResponse.choices?.[0]?.message?.content || "I couldn't find anything.";

    // Send the data to our Medusa Backend to be saved!
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      await fetch(`${backendUrl}/store/search-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userQuery,
          ai_response: aiMessage,
        } ),
      });
      console.log("Search successfully logged to database!");
    } catch (dbError) {
      console.error("Failed to log to database:", dbError);
    }

    return NextResponse.json({ 
      success: true, 
      originalQuery: userQuery,
      aiResponse: aiMessage 
    });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ error: "Something went wrong with the AI search." }, { status: 500 });
  }
}
// End of Part 2
