// File: apps/storefront/src/modules/products/templates/index.tsx

import { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div className="content-container flex flex-col small:flex-row small:items-start py-12 relative gap-y-8 gap-x-16 mx-auto max-w-7xl px-4">
        
        {/* Left Side: Massive Scrolling Images */}
        <div className="block w-full small:w-[60%] relative">
          <ImageGallery images={product?.images || []} />
        </div>

        {/* Right Side: Sticky Product Info & Add to Cart */}
        <div className="flex flex-col w-full small:w-[40%] gap-y-8 small:sticky small:top-24 py-4">
          <ProductInfo product={product} />
          
          {/* Premium Add to Cart Box */}
          <div className="flex flex-col gap-y-6 bg-gray-50 p-8 rounded-3xl shadow-sm border border-gray-100">
            <Suspense fallback={<ProductActions product={product} region={region} />}>
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>

          <ProductTabs product={product} />
        </div>
      </div>

      {/* Related Products Section */}
      <div className="content-container my-32 mx-auto max-w-7xl px-4 border-t border-gray-200 pt-16">
        <Suspense fallback={<div>Loading related products...</div>}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
