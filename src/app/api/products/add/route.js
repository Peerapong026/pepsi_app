import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Product from "../../../../../models/product";

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, message: "เพิ่มสินค้าสำเร็จ", product });
  } catch (error) {
    return NextResponse.json({ success: false, message: "เพิ่มสินค้าไม่สำเร็จ", error }, { status: 500 });
  }
}
