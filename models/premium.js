// models/Premium.js
import mongoose from "mongoose";

const PremiumSchema = new mongoose.Schema({
  pm_id_premium: { type: String, required: true }, // Unique code e.g., PMS001 / PMP001
  pm_type_premium: { type: String, enum: ["ของชิม", "ของแถม"] }, // type
  pm_name_premium: String,
  pm_category: String,
  pm_volume: String,
  pm_packsize: String,
  pm_numberlot: String,
  pm_expire: String
}, { timestamps: true });

export default mongoose.models.Premium || mongoose.model("Premium", PremiumSchema,"premium");
