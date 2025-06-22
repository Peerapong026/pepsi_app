// 📁 /app/api/premium/add-usage/route.js

import { connectMongDB } from "../../../../../lib/mongodb";
import PremiumUsage from "../../../../../models/premiumUsage";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongDB();
  const body = await req.json();

  try {
    // 🗓️ สร้าง prefix จากวันที่ เช่น GFT250618
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, "");
    const prefix = `GFT${datePart}`;

    let retries = 3;
    let newRecord;

    while (retries > 0) {
      try {
        // 📌 ดึง gift_id ล่าสุดของวันนั้น
        const latest = await PremiumUsage.findOne({
          gift_id: { $regex: `^${prefix}` },
        }).sort({ gift_id: -1 }).lean();

        let runningNumber = "001";
        if (latest) {
          const lastNumber = parseInt(latest.gift_id.slice(-3));
          runningNumber = String(lastNumber + 1).padStart(3, "0");
        }

        const gift_id = `${prefix}${runningNumber}`;

        // 📝 บันทึกข้อมูล
        newRecord = await PremiumUsage.create({
          gift_id,
          gift_storeId: body.gift_storeId,
          gift_premiumId: body.gift_premiumId,
          gift_promotionId: body.gift_promotionId,
          gift_received: body.gift_received,
          gift_used: body.gift_used,
          gift_remaining: body.gift_remaining,
          gift_date: body.gift_date,
          user_id: body.user_id,
        });

        break; // ✅ บันทึกสำเร็จ ออกจาก loop
      } catch (err) {
        if (err.code === 11000) {
          retries--; // 🔁 ถ้ารหัสซ้ำ ให้ลองใหม่
        } else {
          throw err; // 🚨 ถ้าเป็น error อื่น
        }
      }
    }

    if (!newRecord) {
      return NextResponse.json({ success: false, error: "สร้าง gift_id ไม่สำเร็จ" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newRecord });

  } catch (error) {
    console.error("❌ Error saving Premium Usage:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
