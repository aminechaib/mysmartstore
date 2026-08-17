// File: apps/backend/src/api/admin/quick-inventory/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse ) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    
    const { data: variants } = await query.graph({
      entity: "variant",
      fields: [
        "id",
        "title",
        "sku",
        "manage_inventory",
        "product.id",
        "product.title",
        "product.thumbnail",
        "inventory_items.inventory_item_id",
        "inventory_items.inventory.location_levels.location_id",
        "inventory_items.inventory.location_levels.stocked_quantity",
      ],
    })

    const formatted = variants.map((v: any) => {
      const inventoryItem = v.inventory_items?.[0]?.inventory
      const level = inventoryItem?.location_levels?.[0]
      
      return {
        variant_id: v.id,
        product_id: v.product?.id,
        product_title: v.product?.title || "Unknown Product",
        variant_title: v.title,
        sku: v.sku || "No SKU",
        thumbnail: v.product?.thumbnail,
        manage_inventory: v.manage_inventory,
        inventory_item_id: v.inventory_items?.[0]?.inventory_item_id,
        location_id: level?.location_id,
        stocked_quantity: level?.stocked_quantity || 0,
      }
    })

    res.json({ variants: formatted })
  } catch (error: any) {
    console.error("Quick Inventory GET Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { inventory_item_id, location_id, stocked_quantity } = req.body as any

    if (!inventory_item_id) {
      return res.status(400).json({ 
        error: "This product does not have inventory tracking enabled." 
      })
    }

    const inventoryService = req.scope.resolve("inventory")
    const stockLocationService = req.scope.resolve("stock_location")

    let targetLocationId = location_id
    if (!targetLocationId) {
      const locations = await stockLocationService.listStockLocations({})
      targetLocationId = locations[0]?.id
    }

    const existingLevels = await inventoryService.listInventoryLevels({
      inventory_item_id: inventory_item_id,
      location_id: targetLocationId
    })

    if (existingLevels && existingLevels.length > 0) {
      // Pass it as an array of updates to be safe in Medusa v2
      await inventoryService.updateInventoryLevels([
        {
          inventory_item_id: inventory_item_id,
          location_id: targetLocationId,
          stocked_quantity: Number(stocked_quantity)
        }
      ])
    } else {
      await inventoryService.createInventoryLevels([
        {
          inventory_item_id: inventory_item_id,
          location_id: targetLocationId,
          stocked_quantity: Number(stocked_quantity)
        }
      ])
    }

    res.json({ success: true })
  } catch (error: any) {
    console.error("Quick Inventory POST Error:", error.message)
    res.status(500).json({ error: error.message })
  }
}
