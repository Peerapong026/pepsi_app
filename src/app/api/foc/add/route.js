// src/app/api/foc/add/route.js
import { connectMongDB } from "../../../../../lib/mongodb";
import FOC from "../../../../../models/focUsage";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongDB();
  const body = await req.json();

  try {
    // 🗓️ สร้าง prefix จากวันที่ เช่น FOC250619
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, "");
    const prefix = `FOC${datePart}`;

    let retries = 3;
    let newRecord;

    while (retries > 0) {
      try {
        // 📌 ดึง foc_id ล่าสุดของวันนั้น
        const latest = await FOC.findOne({
          foc_id: { $regex: `^${prefix}` },
        }).sort({ foc_id: -1 }).lean();

        let runningNumber = "001";
        if (latest) {
          const lastNumber = parseInt(latest.foc_id.slice(-3));
          runningNumber = String(lastNumber + 1).padStart(3, "0");
        }

        const foc_id = `${prefix}${runningNumber}`;

        // ✅ บันทึกข้อมูลพร้อม foc_id
        newRecord = await FOC.create({
          foc_id,
          foc_storeId: body.foc_storeId,
          foc_premiumId: body.foc_premiumId,
          foc_received: body.foc_received,
          foc_used: body.foc_used,
          foc_remaining: body.foc_remaining,
          foc_date: body.foc_date,
          user_id: body.user_id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        break; // ✅ สำเร็จ
      } catch (err) {
        if (err.code === 11000) {
          retries--; // ถ้ารหัสซ้ำ ลองใหม่
        } else {
          throw err;
        }
      }
    }

    if (!newRecord) {
      return NextResponse.json({ success: false, error: "สร้าง foc_id ไม่สำเร็จ" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newRecord });

  } catch (error) {
    console.error("❌ Error saving FOC:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}