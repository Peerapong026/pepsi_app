// 📁 /src/app/api/premiums/get/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../../lib/mongodb";
import Premium from "../../../../../../models/premium";

export async function GET() {
  try {
    await connectMongDB();

    const premiums = await Premium.find({ pm_type_premium: "ของแถม" }, "pm_id_premium pm_name_premium").lean();

    return NextResponse.json({ premiums });
  } catch (error) {
    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูล Premium ของแถมได้", error },
      { status: 500 }
    );
  }
}
