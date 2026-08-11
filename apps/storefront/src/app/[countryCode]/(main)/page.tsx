// File: apps/storefront/src/app/[countryCode]/(main)/page.tsx

import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "SmartStore | Modern E-Commerce",
  description: "A premium shopping experience powered by AI.",
}

// This forces Next.js to always fetch fresh data during development!
export const dynamic = 'force-dynamic'

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
    limit: 100,
  })

  // =====================================================================
  // 🛠️ 1. CHANGE YOUR COLLECTION HERE
  // Change "electronics" to "products-col" when you are ready!
  // =====================================================================
  const hotCollection = collections?.find(c => c.handle === "hot")
  const newCollection = collections?.find(c => c.handle === "new")

  if (!region) return null

  return (
    <>
      {/* =====================================================================
          🛠️ 2. HERO BANNER
          To change the Hero Image, Text, or Animation, open this file:
          apps/storefront/src/modules/home/components/hero/index.tsx
      ====================================================================== */}
      <Hero />
      
      {/* =====================================================================
          🛠️ 3. MANUAL PROMO BANNER
          You can change the image, text, and link directly right here!
      ====================================================================== */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center gap-0 bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="w-full md:w-1/2 h-[300px] md:h-[500px]">
            {/* CHANGE PROMO IMAGE HERE */}
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070" 
              alt="Promo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-16 text-center md:text-left">
            {/* CHANGE PROMO TEXT HERE */}
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 tracking-tight">
              Exclusive Summer Tech
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Upgrade your lifestyle with our premium selection of devices.
            </p>
            {/* CHANGE PROMO LINK HERE */}
            <LocalizedClientLink href="/store">
              <button className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                Shop The Sale
              </button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* =====================================================================
          🛠️ 4. PRODUCT GRID
          This automatically displays the collection you selected at the top.
      ====================================================================== */}
      <div className="py-8">
          {/* Show the HOT collection with the red borders! */}
        {hotCollection && (
          <ProductRail collection={hotCollection} region={region} />
        )}

        {/* Show the NEW collection normally */}
        {newCollection && (
          <ProductRail collection={newCollection} region={region} />
        )}
      </div>
    </>
  )
}
