// app/api/premium/delete-usage/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb"; // ← ปรับ path ให้ตรงโปรเจกต์คุณ
import PremiumUsage from "../../../../../models/premiumUsage"; // ← ปรับชื่อ/พาธตามที่ใช้จริง

export async function DELETE(req) {
  try {
    await connectMongDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing id" }, { status: 400 });
    }

    const deleted = await PremiumUsage.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("DELETE /premium/delete-usage error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
