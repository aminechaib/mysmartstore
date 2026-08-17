// File: apps/backend/src/api/admin/quick-products/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductsWorkflow } from "@medusajs/core-flows"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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

    // 1. Get the default sales channel & default stock location
    const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL)
    const channels = await salesChannelService.listSalesChannels()
    const defaultChannel = channels[0]

    const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION)
    const locations = await stockLocationService.listStockLocations({})
    const defaultLocation = locations[0]

    // 2. Build the perfect Tech Product payload
    const productPayload = {
      title,
      description,
      collection_id: collection_id !== "none" ? collection_id : undefined,
      sales_channels: defaultChannel ? [{ id: defaultChannel.id }] : [],
      images: image_url ? [{ url: image_url }] : [],
      metadata: { warranty: warranty || "No warranty specified" },
      options: [{ title: "Model", values: ["Standard"] }],
      variants: [
        {
          title: "Standard",
          sku: sku || `REF-${Date.now()}`, 
          manage_inventory: true, // Track inventory
          prices: [{ currency_code: "qar", amount: Number(price) }],
          options: { "Model": "Standard" },
        },
      ],
    }

    // 3. Create the product
    const { result } = await createProductsWorkflow(req.scope).run({
      input: { products: [productPayload] },
    })

    const createdProduct = result[0]
    const variantId = createdProduct.variants[0].id

    // 4. 🛠️ AUTO-LINK TO WAREHOUSE: Find the new inventory item and link it to the location!
    if (defaultLocation) {
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const { data: variantInventory } = await query.graph({
        entity: "variant",
        fields: ["inventory_items.inventory_item_id"],
        filters: { id: variantId }
      })

      const inventoryItemId = variantInventory[0]?.inventory_items?.[0]?.inventory_item_id

      if (inventoryItemId) {
        const inventoryService = req.scope.resolve(Modules.INVENTORY)
        await inventoryService.createInventoryLevels([
          {
            inventory_item_id: inventoryItemId,
            location_id: defaultLocation.id,
            stocked_quantity: 0, // Starts at 0, ready for you to add stock!
          }
        ])
      }
    }

    res.json({ success: true, product: createdProduct })
  } catch (error: any) {
    console.error("Quick Product Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
