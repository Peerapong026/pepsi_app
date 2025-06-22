// 📁/app/api/foc/get/route.js
import { connectMongDB } from "../../../../../lib/mongodb";
import FOC from "../../../../../models/focUsage";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongDB();

    const url = new URL(req.url);
    const storeId = url.searchParams.get("storeId");
    const user_id = url.searchParams.get("user_id");

    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (storeId) filter.foc_storeId = storeId;

    const records = await FOC.find(filter).sort({ foc_date: -1 });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("❌ Error fetching FOC records:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
