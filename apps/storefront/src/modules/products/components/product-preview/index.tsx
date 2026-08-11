// File: apps/storefront/src/modules/products/components/product-preview/index.tsx

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductPrice } from "@lib/util/get-product-price"

export default function ProductPreview({
  product,
  region,
  collectionHandle,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  collectionHandle?: string
}) {
  const { cheapestPrice } = getProductPrice({ product, region })

  // =====================================================================
  // 🛠️ MARKETING SETTINGS
  // =====================================================================
  const TARGET_COLLECTION = "hot"           
  const BADGE_TEXT = "-20% OFF"             
  const BADGE_BG = "bg-gradient-to-r from-red-500 to-orange-500" 
  const SPECIAL_CARD_STYLE = "ring-1 ring-red-500/20 shadow-[0_8px_30px_rgba(239,68,68,0.15)] hover:shadow-[0_8px_40px_rgba(239,68,68,0.3)] hover:-translate-y-2"
  const NORMAL_CARD_STYLE = "hover:shadow-xl hover:-translate-y-1"
  // =====================================================================

  const isSpecial = collectionHandle === TARGET_COLLECTION

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block h-full">
      <div 
        className={`relative h-full flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-500 
        ${isSpecial ? SPECIAL_CARD_STYLE : NORMAL_CARD_STYLE}`}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
          
          {isSpecial && (
            <div className={`absolute top-0 right-0 z-30 ${BADGE_BG} text-white text-xs md:text-sm font-bold px-4 py-2 rounded-bl-xl shadow-lg whitespace-nowrap flex items-center justify-center min-w-[80px]`}>
              {BADGE_TEXT}
            </div>
          )}

          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={true}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10" />
          
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            <div className="w-full py-3 bg-white/90 backdrop-blur-sm text-black text-center text-sm font-bold rounded-full shadow-lg">
              View Details
            </div>
          </div>
        </div>

        {/* Text Container */}
        <div className="p-3 md:p-4 flex flex-col flex-grow">
          {/* 
            🔥 ALIEXPRESS FIX: 
            min-h-[2.5rem] md:min-h-[3rem] forces this box to ALWAYS be exactly 2 lines tall.
            If the name is short, it just leaves empty space so the grid stays perfectly aligned!
          */}
          <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem] mb-3 group-hover:text-blue-600 transition-colors leading-tight">
            {product.title}
          </h3>
          
          {/* Price is pushed to the absolute bottom (mt-auto) and made bolder */}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
            {cheapestPrice && (
              <div className="text-lg font-bold text-black">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
