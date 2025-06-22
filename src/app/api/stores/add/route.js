// 📁 /src/app/api/stores/add/route.js
import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import Store from "../../../../../models/store";

export async function POST(req) {
  try {
    await connectMongDB();
    const body = await req.json();
    const newStore = await Store.create(body);
    return NextResponse.json(newStore, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "ไม่สามารถบันทึกร้านค้าได้", error }, { status: 500 });
  }
}
