// File: apps/backend/src/api/store/search-log/route.ts
// --- PART 1B ---

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse ) {
  const searchLogService = req.scope.resolve("searchLogModuleService")
  
  // We now accept the new data from the frontend
  const { query, ai_response, search_term, results_count } = req.body as any

  try {
    // eslint-disable-next-line @medusajs/no-service-mutations-in-api-route
    const log = await searchLogService.createSearchLogs({
      query: query,
      ai_response: ai_response,
      search_term: search_term,
      results_count: results_count,
    })

    res.status(200).json({ success: true, log: log })
  } catch (error) {
    console.error("Error saving search log:", error)
    res.status(500).json({ success: false, error: "Failed to save search log" })
  }
}
// End of Part 1
