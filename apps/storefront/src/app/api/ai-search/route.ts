// File: apps/storefront/src/app/api/ai-search/route.ts
// --- PART 1 ---

import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

// We are making the rules much stricter so it never mentions other stores!
const SYSTEM_PROMPT = `You are the exclusive personal shopping assistant for OUR premium e-commerce store. 
CRITICAL RULES:
1. NEVER suggest other websites, brands, or platforms (like Amazon, eBay, etc.).
2. Always assume we have what the customer is looking for in our catalog.
3. Analyze their request, extract the key details (color, style, price), and enthusiastically tell them you are preparing those exact items from our collection.
4. Keep your response under 3 sentences. Be friendly, modern, and professional.`;


export async function POST(request: Request) {
  try {
    // 1. Read the data sent from the frontend
    const body = await request.json();
    const userQuery = body.query;

    // 2. Check if the user actually typed something
    if (!userQuery) {
      return NextResponse.json(
        { error: "Please provide a search query." },
        { status: 400 }
      );
    }

    // 3. Prepare the conversation for Mistral
    // We combine our SYSTEM_PROMPT (the brain) with the user's actual search
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery }
    ];

 const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: messages as any,
    });

    // 5. Extract the AI's response
    const aiMessage = chatResponse.choices?.[0]?.message?.content || "I couldn't find anything.";

    // 6. Send the smart response back to the frontend
    return NextResponse.json({ 
      success: true, 
      originalQuery: userQuery,
      aiResponse: aiMessage 
    });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { error: "Something went wrong with the AI search." },
      { status: 500 }
    );
  }
}