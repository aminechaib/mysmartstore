// File: apps/storefront/src/modules/store/templates/index.tsx

import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import FloatingFilters from "@modules/store/components/floating-filters"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      
      {/* Our New Floating Filter Bubble */}
      <FloatingFilters sortBy={sortBy || "created_at"} />

      {/* Minimalist Header */}
      <div className="w-full pt-16 pb-8">
        <div className="content-container mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight">
            The Collection
          </h1>
        </div>
      </div>

      {/* Full-Width Product Grid */}
      <div className="content-container mx-auto max-w-7xl px-4 pb-24">
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sortBy || "created_at"}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
