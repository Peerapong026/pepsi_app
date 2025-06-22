import { NextResponse } from "next/server";
import { connectMongDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";

export async function POST(req) {
  await connectMongDB();
  const body = await req.json();

  const exists = await User.findOne({ user_id: body.user_id });
  if (exists) {
    return NextResponse.json({ success: false, message: "user_id นี้มีอยู่แล้ว" });
  }

  const user = await User.create(body);
  return NextResponse.json({ success: true, data: user });
}
