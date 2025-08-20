// app/api/premium/edit-usage/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb"; // ← ปรับ path ให้ตรงโปรเจกต์คุณ
import PremiumUsage from "../../../../../models/premiumUsage"; // ← ปรับชื่อ/พาธตามที่ใช้จริง

export async function PUT(req) {
  try {
    await connectMongDB();

    const body = await req.json();
    const {
      _id,
      gift_storeId,
      gift_premiumId,
      gift_promotionId = "",
      gift_received,
      gift_used,
      gift_remaining,
      gift_date,
      user_id,
    } = body || {};

    if (!_id) {
      return NextResponse.json({ success: false, message: "Missing _id" }, { status: 400 });
    }

    // แปลงชนิดข้อมูลที่ควรเป็นตัวเลข
    const upd = {
      ...(gift_storeId !== undefined && { gift_storeId }),
      ...(gift_premiumId !== undefined && { gift_premiumId }),
      ...(gift_promotionId !== undefined && { gift_promotionId }),
      ...(gift_received !== undefined && { gift_received: Number(gift_received) }),
      ...(gift_used !== undefined && { gift_used: Number(gift_used) }),
      ...(gift_remaining !== undefined && { gift_remaining: Number(gift_remaining) }),
      ...(gift_date !== undefined && { gift_date }),
      ...(user_id !== undefined && { user_id }),
      updatedAt: new Date(),
    };

    const updated = await PremiumUsage.findByIdAndUpdate(_id, upd, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /premium/edit-usage error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
