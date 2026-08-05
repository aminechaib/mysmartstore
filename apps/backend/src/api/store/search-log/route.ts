// File: apps/backend/src/api/store/search-log/route.ts
// --- PART 1 (Backend API) ---

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse ) {
  const searchLogService = req.scope.resolve("searchLogModuleService")
  const { query, ai_response } = req.body as { query: string, ai_response: string }

  try {
    // eslint-disable-next-line @medusajs/no-service-mutations-in-api-route
    const log = await searchLogService.createSearchLogs({
      query: query,
      ai_response: ai_response,
    })

    res.status(200).json({ 
      success: true, 
      message: "Search logged successfully!",
      log: log 
    })
  } catch (error) {
    console.error("Error saving search log:", error)
    res.status(500).json({ 
      success: false, 
      error: "Failed to save search log to database." 
    })
  }
}
// End of Part 1
