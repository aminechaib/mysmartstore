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
  const { cheapestPrice } = getProductPrice({ product, region })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gray-50 transition-all duration-500 group-hover:shadow-2xl">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        
        {/* Minimalist Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Clean Title & Price */}
      <div className="flex justify-between items-center mt-4 px-1">
        <p className="text-gray-900 font-medium text-sm truncate mr-4">{product.title}</p>
        <div className="text-black font-bold text-sm bg-gray-100 px-3 py-1 rounded-full">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
