// File: apps/storefront/src/app/[countryCode]/(main)/page.tsx

import { Metadata } from "next"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import PromoSection from "@modules/home/components/promo-section" // <-- New Import
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
      
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>

      {/* --- OUR NEW PROMO SECTION --- */}
      <PromoSection />
      
    </>
  )
}
