// 📁 /src/app/api/stores/get/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../../lib/mongodb";
import Store from "../../../../../../models/store";

export async function GET(req) {
  try {
    await connectMongDB();

    const url = new URL(req.url);
    const st_id_Code = url.searchParams.get("st_id_Code");

    if (!st_id_Code) {
      return NextResponse.json({ message: "กรุณาระบุ st_id_Code" }, { status: 400 });
    }

    const store = await Store.findOne({ st_id_Code });

    if (!store) {
      return NextResponse.json({ message: "ไม่พบร้านนี้" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลร้านค้าได้", error },
      { status: 500 }
    );
  }
}
