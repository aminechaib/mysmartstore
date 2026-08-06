// File: apps/backend/src/modules/storefront-section/models/storefront-section.ts

import { model } from "@medusajs/framework/utils"

export const StorefrontSection = model.define("storefront_section", {
  id: model.id().primaryKey(),
  title: model.text(),
  type: model.text(), 
  collection_id: model.text().nullable(), 
  image_url: model.text().nullable(),
  
  // NEW: Dynamic Button Controls!
  show_button: model.boolean().default(true),
  button_text: model.text().default("Shop Now"),
  button_link: model.text().default("/store"),
  
  is_active: model.boolean().default(true),
  sequence: model.number().default(0), 
  animation: model.text().default("fade-up"), 
})
