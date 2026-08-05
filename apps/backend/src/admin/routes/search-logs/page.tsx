// File: apps/backend/src/admin/routes/search-logs/page.tsx
// --- PART 1 ---

import { useState, useEffect } from "react"
import { Container, Heading, Table } from "@medusajs/ui"
import { MagnifyingGlass } from "@medusajs/icons"
import { defineRouteConfig } from "@medusajs/admin-sdk"

// Medusa v2 requires this to be an arrow function!
const SearchLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/search-logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || [])
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err)
        setIsLoading(false)
      })
  }, [])

  // End of Part 1
  // --- PART 2 ---

  return (
    <Container>
      <div className="flex items-center justify-between mb-6">
        <Heading level="h1">Customer Search Logs</Heading>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Customer Query</Table.HeaderCell>
            <Table.HeaderCell>AI Response</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              <Table.Cell colSpan={3} className="text-center py-6">Loading...</Table.Cell>
            </Table.Row>
          ) : logs.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3} className="text-center py-6">No searches logged yet.</Table.Cell>
            </Table.Row>
          ) : (
            logs.map((log) => (
              <Table.Row key={log.id}>
                <Table.Cell>{new Date(log.created_at).toLocaleDateString()}</Table.Cell>
                <Table.Cell className="font-medium">{log.query}</Table.Cell>
                <Table.Cell className="text-gray-500 max-w-md truncate" title={log.ai_response}>
                  {log.ai_response}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </Container>
  )
}

// Export the component as default
export default SearchLogsPage

// Use defineRouteConfig to register the page in the sidebar (Medusa v2 requirement)
export const config = defineRouteConfig({
  label: "Search Logs",
  icon: MagnifyingGlass,
})
// --- END OF CODE ---
