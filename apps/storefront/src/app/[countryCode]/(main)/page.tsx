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

export const dynamic = 'force-dynamic'

// 1. Helper function to fetch your dynamic sections from the backend
async function getStorefrontSections() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/storefront-sections`, {
      next: { revalidate: 0 }, // Always fetch fresh data
    } )
    if (!res.ok) return []
    const data = await res.json()
    return data.storefront_sections || []
  } catch (error) {
    console.error("Failed to fetch storefront sections:", error)
    return []
  }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  // Fetch all collections so we can match them to the dynamic grids
  const { collections } = await listCollections({
    fields: "id, handle, title",
    limit: 100,
  })

  // Fetch the dynamic layout from your Admin Dashboard!
  const sections = await getStorefrontSections()

  if (!region) return null

  return (
    <>
      {/* Always show the Hero at the top (or you can make this dynamic too if it's in your sections!) */}
      <Hero />

      {/* 2. DYNAMIC PAGE BUILDER */}
      {sections.length > 0 ? (
        sections.map((section: any) => {
          
          // Render a Dynamic Promo Banner
          if (section.type === "promo") {
            return (
              <div key={section.id} className="w-full max-w-7xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row items-center gap-0 bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="w-full md:w-1/2 h-[300px] md:h-[500px]">
                    <img 
                      src={section.image_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"} 
                      alt={section.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="w-full md:w-1/2 p-8 md:p-16 text-center md:text-left">
                    <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 tracking-tight">
                      {section.title || "Exclusive Sale"}
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      {section.description || "Upgrade your lifestyle with our premium selection."}
                    </p>
                    <LocalizedClientLink href={section.link_url || "/store"}>
                      <button className="px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                        {section.button_text || "Shop Now"}
                      </button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
             )
          }

          // Render a Dynamic Product Grid
          if (section.type === "product_grid" && section.collection_handle) {
            const matchedCollection = collections?.find(c => c.handle === section.collection_handle)
            if (matchedCollection) {
              return (
                <div key={section.id} className="py-8">
                  <ProductRail collection={matchedCollection} region={region} />
                </div>
              )
            }
          }

          return null
        })
      ) : (
        // Fallback if no sections are found in the database
        <div className="py-20 text-center text-gray-500">
          <p>No dynamic sections found. Please add them in the Admin Dashboard.</p>
        </div>
      )}
    </>
  )
}
