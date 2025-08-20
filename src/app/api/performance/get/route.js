import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Performance from "../../../../../models/performance";

export async function GET(req) {
  try {
    await connectMongDB();

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");     // optional
    const user_id = searchParams.get("user_id");     // required (เว้นกรณี admin ที่คุณอยากให้เห็นทั้งหมด)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "200", 10), 500); // เพดานป้องกันหนักเกิน

    if (!user_id) {
      return NextResponse.json({ success: false, message: "ไม่พบ user_id" }, { status: 400 });
    }

    // ถ้าต้องการให้ admin เห็นทั้งหมดค่อยมาเช็ค role ที่นี่ (ดึงจาก token/session)
    const query = { user_id };
    if (storeId && storeId !== "ALL") {
      query.per_storeId = storeId; // เท่ากันตรง ๆ เร็วกว่า regex
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Performance.find(query)
        .sort({ per_date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Performance.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: { page, limit, total, hasMore: skip + data.length < total },
    });
  } catch (error) {
    console.error("❌ Error fetching performance records:", error);
    return NextResponse.json({ success: false, message: "ไม่สามารถดึงข้อมูลได้" }, { status: 500 });
  }
}
