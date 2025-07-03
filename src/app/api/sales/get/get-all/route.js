import { connectMongDB } from "../../../../../../lib/mongodb";
import Sale from "../../../../../../models/sale";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongDB();
    const sales = await Sale.find().sort({ sal_date: -1 });
    return NextResponse.json({ success: true, sales });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch sales", error: error.message }, { status: 500 });
  }
}
