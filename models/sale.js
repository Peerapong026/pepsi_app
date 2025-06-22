// models/Sale.js
import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema({
  sal_skuId: {
    type: String,
    required: true,
    trim: true,
  },
  sal_status: {
    type: String,
    enum: ["มีขาย", "หมด", "ไม่ขาย"],
    required: true,
  },
  sal_quantity: {
    type: Number,
    default: 0,
  },
  sal_unitPrice: {
    type: Number,
    default: 0,
  },
  sal_totalPrice: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const SaleSchema = new mongoose.Schema({
  sal_id: {
    type: String,
    required: true,
    unique: true,
  },
  sal_storeId: {
    type: String,
    required: true,
  },
  sal_date: {
    type: String,
    required: true,
  },
  sal_items: {
    type: [SaleItemSchema], // array ซ้อนเก็บแต่ละ SKU
    required: true,
  },
  user_id: String,
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema, "sale");
