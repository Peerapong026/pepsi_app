import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Performance from "../../../../../models/performance";
import Counter from "../../../../../models/Counter";

// สร้าง prefix จากวันที่: 'PER' + YYMMDD
function buildPerPrefix(dateStr) {
  const ymd = (dateStr || "").replace(/-/g, ""); // 20250618
  const yymmdd = ymd.slice(2);                   // 250618
  return `PER${yymmdd}`;                         // PER250618
}

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    // ตรวจขั้นต่ำ
    if (!body?.user_id) {
      return NextResponse.json({ success: false, message: "ไม่พบ user_id" }, { status: 400 });
    }
    if (!body?.per_date) {
      // ถ้าไม่ส่งวันที่มา จะใช้วันนี้ (รูปแบบ YYYY-MM-DD)
      body.per_date = new Date().toISOString().split("T")[0];
    }

    // ทำความสะอาด/แปลงค่า
    const per_quantity = Number(body.per_quantity || 0);
    if (Number.isNaN(per_quantity) || per_quantity <= 0) {
      return NextResponse.json({ success: false, message: "per_quantity ต้องเป็นจำนวนเต็มมากกว่า 0" }, { status: 400 });
    }

    // สร้าง per_id แบบกันชน ด้วย atomic counter
    const prefix = buildPerPrefix(body.per_date);              // เช่น PER250618
    const counterId = `performance:${prefix}`;                 // key แยกตามวัน
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqStr = String(counter.seq).padStart(3, "0");       // 001
    const per_id = `${prefix}${seqStr}`;                       // PER250618001

    // รองรับฟิลด์สินค้า FOC (เป็น optional — เอกสารเก่าไม่พัง)
    const per_premiumId = body.per_premiumId || "";
    const per_premiumName = body.per_premiumName || "";

    const doc = await Performance.create({
      per_id,
      per_storeId: body.per_storeId || "",
      per_storeName: body.per_storeName || "",
      per_premiumId,
      per_premiumName,
      per_result: body.per_result,            // "ซื้อ" | "ไม่ซื้อ"
      per_reason: body.per_reason || "",
      per_quantity,
      per_date: body.per_date,
      user_id: body.user_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (error) {
    // ถ้า unique index ที่ per_id ชนด้วยเหตุสุดวิสัย (เช่น deploy หลาย instance)
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "per_id ซ้ำ กรุณาลองใหม่อีกครั้ง" }, { status: 409 });
    }
    console.error("❌ Error saving performance:", error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึก" }, { status: 500 });
  }
}
