import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Product from "../../../../../models/product";

export async function GET() {
  try {
    await connectMongDB();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error }, { status: 500 });
  }
}
