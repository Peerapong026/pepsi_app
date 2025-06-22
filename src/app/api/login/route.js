import { connectMongDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";

export async function POST(req) {
  const { user_id, user_password } = await req.json();
  await connectMongDB();
  const user = await User.findOne({ user_id, user_password });
  if (!user) {
    return new Response(JSON.stringify({ success: false }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true, user }), { status: 200 });
}
