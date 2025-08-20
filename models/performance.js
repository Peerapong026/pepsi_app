// models/Performance.js
import mongoose from "mongoose";

const PerformanceSchema = new mongoose.Schema(
  {
    per_id: { type: String, required: true, unique: true },
    per_storeId: String,
    per_storeName: String,

    // ✅ สินค้าที่ชิม (ดึงจาก FOC/Sampling)
    per_premiumId: { type: String, default: "" },   // เช่น pm_id_premium
    per_premiumName: { type: String, default: "" }, // เช่น pm_name_premium

    per_result: { type: String, enum: ["ซื้อ", "ไม่ซื้อ"] },
    per_reason: String,
    per_quantity: Number,
    per_date: String,
    user_id: String,
  },
  { timestamps: true }
);

export default mongoose.models.Performance ||
  mongoose.model("Performance", PerformanceSchema, "performance");
