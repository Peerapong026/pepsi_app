// 📁 /app/api/premium/get-usage/route.js

import { connectMongDB } from "../../../../../../lib/mongodb";
import PremiumUsage from "../../../../../../models/premiumUsage";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongDB();

    const url = new URL(req.url);
    const storeIds = url.searchParams.getAll("storeId"); // ใช้ getAll() เพื่อรองรับหลายร้าน

    if (!storeIds || storeIds.length === 0) {
      return NextResponse.json({ success: false, error: "ไม่พบ storeId" }, { status: 400 });
    }

    const records = await PremiumUsage.find({ gift_storeId: { $in: storeIds } }).sort({ gift_date: -1 });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("❌ Error fetching Premium Usage:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
