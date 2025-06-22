import { connectMongDB } from "../../../../../lib/mongodb";
import Sale from "../../../../../models/sale";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongDB();
    const user_id = url.searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ success: false, error: "ไม่พบ user_id" }, { status: 400 });
    }
    const sales = await Sale.find().sort({ sal_date: -1 });
    return NextResponse.json({ sales });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch sales", error: error.message }, { status: 500 });
  }
}
