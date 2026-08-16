// File: apps/backend/src/api/admin/quick-products/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductsWorkflow } from "@medusajs/core-flows"

export async function POST(req: MedusaRequest, res: MedusaResponse ) {
  try {
    const { 
      title, 
      description, 
      price, 
      collection_id, 
      image_url, 
      warranty,
      sku
    } = req.body as any

    if (!title || !price) {
      return res.status(400).json({ error: "Title and Price are required." })
    }

    // 1. Get the default sales channel
    const salesChannelService = req.scope.resolve("sales_channel")
    const channels = await salesChannelService.listSalesChannels()
    const defaultChannel = channels[0]

    // 2. Build the perfect Tech Product payload
    const productPayload = {
      title,
      description,
      collection_id: collection_id !== "none" ? collection_id : undefined,
      sales_channels: defaultChannel ? [{ id: defaultChannel.id }] : [],
      images: image_url ? [{ url: image_url }] : [],
      metadata: { 
        warranty: warranty || "No warranty specified" // 🛠️ Saves your custom warranty!
      },
      
      // Auto-create the dummy "Model" option so Medusa is happy
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        {
          title: "Standard",
          sku: sku || `REF-${Date.now()}`, // Auto-generates a reference if you leave it blank!
          manage_inventory: false, // Keeps it instantly available for purchase
          prices: [
            {
              currency_code: "qar",
              amount: Number(price),
            },
          ],
          options: { "Model": "Standard" },
        },
      ],
    }

    // 3. Run the official Medusa workflow
    const { result } = await createProductsWorkflow(req.scope).run({
      input: { products: [productPayload] },
    })

    res.json({ success: true, product: result[0] })
  } catch (error: any) {
    console.error("Quick Product Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
