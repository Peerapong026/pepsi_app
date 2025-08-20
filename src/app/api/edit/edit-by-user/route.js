// 📁 /app/api/edit/edit-by-user/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Sale from "../../../../../models/sale";
import FOC from "../../../../../models/focUsage";
import Premium from "../../../../../models/premiumUsage";
import Performance from "../../../../../models/performance";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const role = searchParams.get("role");
  const type = searchParams.get("type");

  if (!user_id || !role || !type) {
    return NextResponse.json({ success: false, message: "user_id, role, and type are required" }, { status: 400 });
  }

  await connectMongDB();

  const query = role === "admin" ? {} : { user_id };

  let records = [];
  switch (type) {
    case "sale":
      records = await Sale.find(query).sort({ sal_date: -1 });
      break;
    case "foc":
      records = await FOC.find(query).sort({ foc_date: -1 });
      break;
    case "premium":
      records = await Premium.find(query).sort({ pm_date: -1 });
      break;
    case "performance":
      records = await Performance.find(query).sort({ pf_date: -1 });
      break;
    default:
      return NextResponse.json({ success: false, message: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: records });
}
