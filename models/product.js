// models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  sku_id: String,
  sku_name: String,
  sku_category: String,
  sku_volume: String,
  sku_packsize: String,
  sku_numberlot: String,
  sku_expiration_date: String
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema,"product");
