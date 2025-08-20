import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Sales from "../../../../../models/sale";

export async function PUT(req, ctx) {
  try {
    await connectMongDB();

    // รองรับทั้งสองแบบ: /edit/[id] (ctx?.params?.id) และ /edit?id=...
    const searchParams = new URL(req.url).searchParams;
    const id = ctx?.params?.id || searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "missing id" }, { status: 400 });
    }

    const body = await req.json();

    // ทำความสะอาด/คำนวณ sal_items ให้ชัดเจน
    const items = (body.sal_items || []).map((it) => {
      const qty = Number(it.sal_quantity || 0);
      const price = Number(it.sal_unitPrice || 0);
      const total =
        it.sal_totalPrice != null
          ? Number(it.sal_totalPrice)
          : Number(qty * price);

      return {
        sal_skuId: String(it.sal_skuId || ""),
        sal_status: it.sal_status, // "มีขาย" | "หมด" | "ไม่ขาย"
        sal_quantity: qty,
        sal_unitPrice: price,
        sal_totalPrice: total,
      };
    });

    const updated = await Sales.findByIdAndUpdate(
      id,
      {
        sal_storeId: body.sal_storeId,
        sal_date: body.sal_date,
        sal_items: items,
      },
      { new: true, runValidators: true } // เปิด validator ของ enum/number ฯลฯ
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: "not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("PUT /api/sales/edit error:", e);
    return NextResponse.json({ success: false, message: e.message || String(e) }, { status: 500 });
  }
}
