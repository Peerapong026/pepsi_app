// models/Store.js
import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema({
  st_id_Code: { type: String, required: true, unique: true }, // PK
  st_Agency: String,
  st_Region: String,
  st_DT_Name: String,
  st_DT_Code: String,
  st_store_Name: String,
}, { timestamps: true });

export default mongoose.models.Store || mongoose.model("Store", StoreSchema,"store");
