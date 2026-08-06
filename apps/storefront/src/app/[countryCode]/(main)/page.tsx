// File: apps/storefront/src/app/[countryCode]/(main)/page.tsx

import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import PromoSection from "@modules/home/components/promo-section"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "SmartStore | Modern E-Commerce",
  description: "A premium shopping experience powered by AI.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      
      {/* Featured Products Section */}
      <div className="py-24 bg-white">
        <div className="content-container mx-auto max-w-7xl px-4 mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
            New Arrivals
          </h2>
          <p className="text-gray-500 mt-4 font-light">
            Discover the latest additions to our premium collection.
          </p>
        </div>
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>

      <PromoSection />
    </>
  )
}
