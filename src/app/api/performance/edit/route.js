// app/api/performance/edit/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb"; // ← ปรับ path ตามโปรเจกต์
import Performance from "../../../../../models/performance";

export async function PUT(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    const {
      _id,                    // ← จำเป็น
      per_storeId,
      per_storeName,
      per_premiumId,
      per_premiumName,
      per_result,             // "ซื้อ" | "ไม่ซื้อ"
      per_reason,
      per_quantity,
      per_date,
      user_id,
    } = body || {};

    if (!_id) {
      return NextResponse.json({ success: false, message: "Missing _id" }, { status: 400 });
    }

    const upd = {
      ...(per_storeId !== undefined && { per_storeId }),
      ...(per_storeName !== undefined && { per_storeName }),
      ...(per_premiumId !== undefined && { per_premiumId }),
      ...(per_premiumName !== undefined && { per_premiumName }),
      ...(per_result !== undefined && { per_result }),
      ...(per_reason !== undefined && { per_reason }),
      ...(per_quantity !== undefined && { per_quantity: Number(per_quantity) }),
      ...(per_date !== undefined && { per_date }),
      ...(user_id !== undefined && { user_id }),
      updatedAt: new Date(),
    };

    const updated = await Performance.findByIdAndUpdate(_id, upd, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PUT /performance/edit error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
