// File: apps/storefront/src/app/api/ai-search/route.ts
// --- PART 1 ---

import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey });

// The upgraded multilingual brain!
const SYSTEM_PROMPT = `You are the exclusive personal shopping assistant for OUR premium e-commerce store. 
CRITICAL RULES:
1. NEVER suggest other websites or brands.
2. Detect the language the user is using and write your 'message' in that EXACT same language (e.g., if they speak Arabic, reply in Arabic).
3. Translate the core product they want into ENGLISH for the 'search_term' (because our database is in English).
4. Keep the 'search_term' broad and simple (1-2 words max, like "watch" or "black shirt") so we can show them multiple options.
5. You MUST respond in valid JSON format exactly like this:
{
  "message": "Your friendly 2-sentence response to the customer in their language",
  "search_term": "the English search term"
}`;
// --- PART 2 ---

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

    // We tell Mistral to strictly return a JSON object
    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: messages as any,
      responseFormat: { type: "json_object" }
    });

    // 1. Parse the JSON response from Mistral
    const aiContent = chatResponse.choices?.[0]?.message?.content || "{}";
    let parsedAi;
    try {
      parsedAi = JSON.parse(aiContent);
    } catch (e) {
      parsedAi = { message: "I couldn't process that request.", search_term: "" };
    }

    const aiMessage = parsedAi.message || "I couldn't find anything.";
    const searchTerm = parsedAi.search_term || "";

    // 2. Fetch real products from Medusa using the broad English search term
    let products = [];
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

    if (searchTerm ) {
      try {
        const productRes = await fetch(`${backendUrl}/store/products?q=${encodeURIComponent(searchTerm)}`, {
          method: "GET",
          headers: {
            "x-publishable-api-key": publishableKey,
          },
        });

        if (productRes.ok) {
          const productData = await productRes.json();
          products = productData.products || [];
        } else {
          console.error("Failed to fetch products:", await productRes.text());
        }
      } catch (prodError) {
        console.error("Error fetching products from Medusa:", prodError);
      }
    }

// End of Part 2
// --- PART 3 ---

    // 3. Send the data to our Medusa Backend to be saved!
    try {
      const dbRes = await fetch(`${backendUrl}/store/search-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": publishableKey,
        },
        body: JSON.stringify({
          query: userQuery,
          ai_response: aiMessage,
        }),
      });

      if (!dbRes.ok) {
        console.error("Backend rejected the save:", await dbRes.text());
      } else {
        console.log("Search successfully logged to database!");
      }
    } catch (dbError) {
      console.error("Failed to connect to backend:", dbError);
    }

    // 4. Send the smart response AND the products back to the frontend
    return NextResponse.json({ 
      success: true, 
      originalQuery: userQuery,
      aiResponse: aiMessage,
      products: products 
    });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ error: "Something went wrong with the AI search." }, { status: 500 });
  }
}
// --- END OF CODE ---
