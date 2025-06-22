// 📁 /src/app/api/stores/get/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../../lib/mongodb";
import Store from "../../../../../../models/store";

export async function GET() {
  try {
    await connectMongDB();

    const stores = await Store.find({}, "st_id_Code st_store_Name").lean(); // ดึงเฉพาะ 2 ฟิลด์
    return NextResponse.json({ stores });
  } catch (error) {
    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลร้านค้าได้", error },
      { status: 500 }
    );
  }
}
