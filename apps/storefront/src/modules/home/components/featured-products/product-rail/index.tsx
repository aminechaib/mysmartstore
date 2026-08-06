// File: apps/storefront/src/modules/home/components/featured-products/product-rail/index.tsx

import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  // 1. Try to fetch products using a simpler collection_id format
  let { products } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id, // FIXED: Removed the array brackets []
      limit: 10, 
    }
  }).catch(() => ({ products: [] }))

  // 2. FALLBACK: If it still returns 0, force it to fetch ANY 10 products so the grid isn't empty!
  if (!products || products.length === 0) {
    const fallback = await listProducts({
      regionId: region.id,
      queryParams: { limit: 10 }
    }).catch(() => ({ products: [] }))
    
    products = fallback.products || []
  }

  // If absolutely no products exist in the store for this region, hide the grid
  if (!products || !products.length) {
    return null
  }

  return (
    <div className="content-container py-8 mx-auto max-w-[1400px] px-4">
      <div className="flex items-end justify-between mb-6 border-b border-gray-200 pb-3">
        <h3 className="text-xl md:text-2xl font-bold text-black tracking-tight">
          {collection.title}
        </h3>
        <LocalizedClientLink 
          href={`/collections/${collection.handle}`}
          className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          View All →
        </LocalizedClientLink>
      </div>
      
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 items-start pb-8">
        {products.map((product) => (
          <li key={product.id} className="w-full">
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
