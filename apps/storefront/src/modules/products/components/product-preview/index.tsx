// File: apps/storefront/src/modules/products/components/product-preview/index.tsx

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // Get the correct price based on the customer's region
  const { cheapestPrice } = getProductPrice({
    product,
    region,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block w-full"
    >
      {/* Image Container with Hover Effects */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 transition-shadow duration-300 group-hover:shadow-lg">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        
        {/* Dark Overlay & Sliding Button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-white text-black px-6 py-2 rounded-full font-semibold text-sm shadow-xl">
            View Details
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col mt-4">
        <p className="text-gray-900 font-semibold text-lg truncate" title={product.title}>
          {product.title}
        </p>
        <div className="flex items-center gap-x-2 mt-1 text-gray-600">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
