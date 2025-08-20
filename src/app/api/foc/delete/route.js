import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import FOC from "../../../../../models/focUsage";

export async function DELETE(req) {
  try {
    await connectMongDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing id parameter" }, { status: 400 });
    }

    const deleted = await FOC.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: "FOC record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
