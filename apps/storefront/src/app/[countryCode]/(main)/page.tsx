// File: apps/storefront/src/app/[countryCode]/(main)/page.tsx

import { Metadata } from "next"
import DynamicBuilder from "@modules/home/components/dynamic-builder"
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

  // Fetch all collections so the Dynamic Builder can link them to your grids
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* 
        The hardcoded Hero is GONE! 
        Now, 100% of the home page is controlled by your Admin Dashboard.
        Just make sure your first section in the dashboard is a "Campaign Banner"!
      */}
      <DynamicBuilder region={region} collections={collections} />
    </>
  )
}
