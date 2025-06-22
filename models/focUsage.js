// models/FocUsage.js
import mongoose from "mongoose";

const FocUsageSchema = new mongoose.Schema({
  foc_id: String, 
  foc_storeId: String,       // FK
  foc_premiumId: String,     // FK
  foc_received: Number,
  foc_used: Number,
  foc_remaining: Number,
  foc_date: String,
  user_id: String,
}, { timestamps: true });

export default mongoose.models.FocUsage || mongoose.model("FocUsage", FocUsageSchema,"focUsage");
