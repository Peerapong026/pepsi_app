// /app/api/sales/get/get-by-id/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../../lib/mongodb";
import Sales from "../../../../../../models/sale";
import Product from "../../../../../../models/product"; // ปรับชื่อ model ให้ตรง

export async function GET(req) {
  try {
    await connectMongDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "missing id" }, { status: 400 });
    }

    const doc = await Sales.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ success: false, message: "not found" }, { status: 404 });
    }

    const skuIds = (doc.sal_items || []).map(i => String(i.sal_skuId));
    if (skuIds.length) {
      // ดึงชื่อสินค้าตาม sku_id
      const prods = await Product.find(
        { sku_id: { $in: skuIds } },
        { sku_id: 1, sku_name: 1 }
      ).lean();

      const nameMap = new Map(prods.map(p => [String(p.sku_id), p.sku_name]));
      doc.sal_items = (doc.sal_items || []).map(i => ({
        ...i,
        sal_skuName: nameMap.get(String(i.sal_skuId)) || ""
      }));
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "internal error" }, { status: 500 });
  }
}
