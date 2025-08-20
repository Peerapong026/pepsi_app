import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import FOC from "../../../../../models/focUsage";

export async function PUT(req) {
  try {
    await connectMongDB();
    const body = await req.json();

    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "Missing _id" }, { status: 400 });
    }

    const updated = await FOC.findByIdAndUpdate(_id, { ...updateData, updatedAt: new Date() }, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "FOC record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
