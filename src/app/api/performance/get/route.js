// 📁 /app/api/performance/get/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Performance from "../../../../../models/performance";

export async function GET(req) {
  await connectMongDB();

  const url = new URL(req.url);
  const storeId = url.searchParams.get("storeId");
  const user_id = url.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ message: "ไม่พบ user_id" }, { status: 400 });
  }

  try {
    const records = await Performance.find({ per_storeId: { $regex: storeId } }).sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error) {
    console.error("❌ Error fetching performance records:", error);
    return NextResponse.json({ message: "ไม่สามารถดึงข้อมูลได้", error }, { status: 500 });
  }
}
