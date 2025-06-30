// 📁 /api/export-data/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import FOC from "../../../../../models/focUsage";
import Premium from "../../../../../models/premiumUsage";
import Performance from "../../../../../models/performance";
import Sales from "../../../../../models/sale";

export async function GET() {
  try {
    await connectMongDB();

    const [foc, premium, performance, sales] = await Promise.all([
      FOC.find().lean(),
      Premium.find().lean(),
      Performance.find().lean(),
      Sales.find().lean(),
    ]);

    return NextResponse.json({ foc, premium, performance, sales });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
