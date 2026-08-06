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
  // Fetch up to 8 products to make the grid look full and beautiful
  const { products } = await listProducts({
    region_id: region.id,
    collection_id: [collection.id],
    limit: 8, 
  })

  if (!products || !products.length) {
    return null
  }

  return (
    <div className="content-container py-12 mx-auto max-w-7xl px-4">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-12 border-b border-gray-200 pb-4">
        <h3 className="text-2xl md:text-3xl font-bold text-black tracking-tight">
          {collection.title}
        </h3>
        <LocalizedClientLink 
          href={`/collections/${collection.handle}`}
          className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          View Collection →
        </LocalizedClientLink>
      </div>
      
      {/* Masonry Editorial Grid (Staggered Layout) */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 items-start pb-16">
        {products.map((product, index) => {
          // Create the staggered editorial effect by pushing every odd item down
          const isStaggered = index % 2 !== 0;
          
          return (
            <li 
              key={product.id} 
              className={`w-full transition-all duration-500 ${isStaggered ? 'sm:mt-16' : ''}`}
            >
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
