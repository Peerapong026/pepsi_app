// 📁 /src/app/api/performance/add/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Performance from "../../../../../models/performance";

function generatePerId(dateStr, count) {
  const formatted = dateStr.replace(/-/g, "").slice(2); // '250618'
  const sequence = String(count + 1).padStart(3, "0");  // '001'
  return `PER${formatted}${sequence}`;
}

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    if (!body.user_id) {
          return NextResponse.json({ message: "ไม่พบ user_id" }, { status: 400 });
    }

    const dateStr = body.per_date || new Date().toISOString().split("T")[0];

    // นับรายการที่มี per_date เดียวกัน
    const countToday = await Performance.countDocuments({ per_date: dateStr });

    // เพิ่ม per_id ที่สร้างอัตโนมัติ
    const newRecord = new Performance({
      per_id: generatePerId(dateStr, countToday),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newRecord.save();

    return NextResponse.json({ message: "บันทึกข้อมูลสำเร็จ", data: newRecord });
  } catch (error) {
    console.error("❌ Error saving performance:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการบันทึก", error }, { status: 500 });
  }
}
