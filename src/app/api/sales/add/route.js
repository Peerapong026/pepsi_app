// 📁 /app/api/sales/add/route.js
import { connectMongDB } from "../../../../../lib/mongodb";
import mongoose from "mongoose";
import Sale from "../../../../../models/sale";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    if (!body.user_id || !body.sal_storeId || !body.sal_items) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const filteredItems = body.sal_items.filter(item => item.sal_status);
    if (filteredItems.length === 0) {
      return NextResponse.json({ message: "กรุณาเลือกสถานะสินค้าบางรายการ" }, { status: 400 });
    }

    if (filteredItems.some(item => !mongoose.Types.ObjectId.isValid(item.sal_skuId))) {
      return NextResponse.json({ message: "sal_skuId ไม่ถูกต้อง" }, { status: 400 });
    }

    const today = new Date();
    const prefix = "SAL";
    const dateStr = today.toISOString().slice(0, 10).split("-").reverse().join("").slice(0, 6); // ddmmyy
    const pattern = new RegExp(`^${prefix}${dateStr}\\d{3}$`);

    const lastSale = await Sale.findOne({ sal_id: { $regex: pattern } }).sort({ sal_id: -1 });

    let nextNumber = 1;
    if (lastSale) {
      const lastNum = parseInt(lastSale.sal_id.slice(-3));
      nextNumber = lastNum + 1;
    }

    const sal_id = `${prefix}${dateStr}${String(nextNumber).padStart(3, "0")}`;

    const itemsWithTotal = filteredItems.map(item => ({
      sal_skuId: new mongoose.Types.ObjectId(item.sal_skuId),
      sal_status: item.sal_status,
      sal_quantity: parseFloat(item.sal_quantity || 0),
      sal_unitPrice: parseFloat(item.sal_unitPrice || 0),
      sal_totalPrice: parseFloat(item.sal_quantity || 0) * parseFloat(item.sal_unitPrice || 0),
    }));

    const newSale = await Sale.create({
      sal_id,
      sal_storeId: body.sal_storeId,
      sal_date: body.sal_date,
      sal_items: itemsWithTotal,
      user_id: body.user_id,
    });

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating Sale:", error);
    return NextResponse.json({ message: "Failed to save sale", error: error.message }, { status: 500 });
  }
}
