// src/app/api/sales/delete/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Sales from "../../../../../models/sale"; // <- เปลี่ยนให้ตรงกับชื่อ model ของคุณ

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success:false, message:"missing id" }, { status:400 });
    }

    await connectMongDB();
    const doc = await Sales.findByIdAndDelete(id);
    if (!doc) {
      return NextResponse.json({ success:false, message:"not found" }, { status:404 });
    }

    return NextResponse.json({ success:true, data:doc });
  } catch (e) {
    return NextResponse.json({ success:false, message:String(e) }, { status:500 });
  }
}

