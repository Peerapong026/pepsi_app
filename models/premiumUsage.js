// models/PremiumUsage.js
import mongoose from "mongoose";

const PremiumUsageSchema = new mongoose.Schema({
  gift_id: { type: String, unique: true },
  gift_storeId: { type: String, ref: "Store" },
  gift_premiumId: { type: String, ref: "Premium" },
  gift_promotionId: String,
  gift_received: Number,
  gift_used: Number,
  gift_remaining: Number,
  gift_date: String,
  user_id: String,
}, { timestamps: true });

export default mongoose.models.PremiumUsage || mongoose.model("PremiumUsage", PremiumUsageSchema,"premiumUsage");
