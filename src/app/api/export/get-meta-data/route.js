// 📁 /api/get-meta-data/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Store from "../../../../../models/store";
import Product from "../../../../../models/product";
import Premium from "../../../../../models/premium";

export async function GET() {
  try {
    await connectMongDB();

    const [stores, products, premiums] = await Promise.all([
      Store.find().lean(),
      Product.find().lean(),
      Premium.find().lean(),
    ]);

    return NextResponse.json({ stores, products, premiums });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
