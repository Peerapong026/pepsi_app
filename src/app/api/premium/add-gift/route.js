import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Premium from "../../../../../models/premium";

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    if (!body.pm_id_premium || body.pm_type_premium !== "ของแถม") {
      return NextResponse.json({ message: "ข้อมูลไม่ครบหรือประเภทไม่ถูกต้อง" }, { status: 400 });
    }

    await Premium.create(body);
    return NextResponse.json({ message: "บันทึกของแถมสำเร็จ" }, { status: 201 });
  } catch (error) {
    console.error("❌ POST /add-gift error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error }, { status: 500 });
  }
}
