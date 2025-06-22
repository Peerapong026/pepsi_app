import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
  user_id: { type: String, required: true, unique: true, trim: true },
  user_password: { type: String, required: true },
  user_firstname: { type: String, required: true, trim: true },
  user_lastname: { type: String, required: true, trim: true },
  user_phone: { type: String, required: true, trim: true },
  user_email: { type: String, required: true, trim: true, lowercase: true },
  user_storeId: { type: [String], default: [] },
  user_role: { type: String, enum: ["admin", "member"], default: "member" }
},{
    timestamps: true, // เพิ่ม createdAt, updatedAt
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema,"user");
