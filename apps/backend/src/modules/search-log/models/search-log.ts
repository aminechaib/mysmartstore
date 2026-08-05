// File: apps/backend/src/modules/search-log/models/search-log.ts
// --- PART 1 ---
import { model } from "@medusajs/framework/utils"


// This defines a new table in your PostgreSQL database called "search_log"
export const SearchLog = model.define("search_log", {
  id: model.id().primaryKey(),
  query: model.text(),
  ai_response: model.text().nullable(),
})

// End of Part 1
