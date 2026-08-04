// File: apps/storefront/src/components/AiSearch.tsx
// --- PART 1 ---

"use client"; // This tells Next.js this is an interactive frontend component

import { useState } from "react";

export default function AiSearch() {
  // These variables store our data while the user interacts with the page
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

// End of Part 1
// --- PART 2 ---

  // This function runs when the user submits their search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from reloading
    
    if (!query.trim()) return; // Don't search if the input is empty

    setIsLoading(true);
    setAiResponse(""); // Clear the old response

    try {
      // Send the request to our Next.js API
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.success) {
        setAiResponse(data.aiResponse);
      } else {
        setAiResponse("Sorry, I had trouble understanding that. Please try again.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setAiResponse("An error occurred while searching.");
    } finally {
      setIsLoading(false);
    }
  };

// End of Part 2
// --- PART 3 ---

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., I need a dark, minimalist outfit under $150..."
          className="w-full px-6 py-4 text-gray-800 bg-white border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 px-6 py-2 text-white bg-black rounded-full hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? "Thinking..." : "Search"}
        </button>
      </form>

      {/* Display the AI Response */}
      {aiResponse && (
        <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            AI Assistant
          </h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {aiResponse}
          </p>
        </div>
      )}
    </div>
  );
}
// --- END OF CODE ---
