// 📁 /app/api/sales/get/get-by-user/route.js
import { connectMongDB } from "../../../../../../lib/mongodb";
import Sale from "../../../../../../models/sale";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongDB();
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ message: "กรุณาระบุ user_id" }, { status: 400 });
    }

    const sales = await Sale.find({ user_id }).sort({ createdAt: -1 }); // เรียงใหม่สุดก่อน
    return NextResponse.json({ sales });
  } catch (error) {
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error: error.message }, { status: 500 });
  }
}
