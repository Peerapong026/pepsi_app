// 📁 /api/auth/check-user-id/route.js
import { connectMongDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  await connectMongDB();
  const existingUser = await User.findOne({ user_id });

  return NextResponse.json({ exists: !!existingUser });
}
