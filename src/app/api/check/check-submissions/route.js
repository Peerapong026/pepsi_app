// 📁 /app/api/check/check-submissions/route.js
import { connectMongDB } from "../../../../../lib/mongodb";
import Sale from "../../../../../models/sale";
import PremiumUsage from "../../../../../models/premiumUsage";
import Performance from "../../../../../models/performance";
import FocUsage from "../../../../../models/focUsage";
import User from "../../../../../models/user";
import Store from "../../../../../models/store";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const sup_id = searchParams.get("sup_id");

    if (!date || !sup_id) {
      return NextResponse.json({ success: false, message: "กรุณาระบุ date และ sup_id" }, { status: 400 });
    }

    const user = await User.findOne({ user_id: sup_id, user_role: { $in: ["sup", "admin"] } });
      if (!user) {
        return NextResponse.json({ success: false, message: "ไม่พบผู้ใช้ที่ระบุ หรือไม่ได้เป็น SUP/ADMIN" }, { status: 404 });
      }

    const supStores = supUser.user_storeId || [];
    const stores = await Store.find({ st_id_Code: { $in: supStores } });

    const [sales, premiumUsages, performances, focUsages] = await Promise.all([
      Sale.find({ sal_date: date }),
      PremiumUsage.find({ gift_date: date }),
      Performance.find({ per_date: date }),
      FocUsage.find({ foc_date: date })
    ]);

    const result = stores.map((store) => {
      const forms = [];
      let user_id = null;
      let submittedAt = null;

      const matchSale = sales.find((s) => s.sal_storeId === store.st_id_Code);
      if (matchSale) {
        forms.push("ยอดขาย");
        user_id = user_id || matchSale.user_id;
        submittedAt = submittedAt || matchSale._id.getTimestamp();
      }

      const matchPremium = premiumUsages.find((p) => p.prm_storeId === store.st_id_Code);
      if (matchPremium) {
        forms.push("พรีเมียม");
        user_id = user_id || matchPremium.user_id;
        submittedAt = submittedAt || matchPremium._id.getTimestamp();
      }

      const matchPerformance = performances.find((p) => p.per_storeId === store.st_id_Code);
      if (matchPerformance) {
        forms.push("การชิม");
        user_id = user_id || matchPerformance.user_id;
        submittedAt = submittedAt || matchPerformance._id.getTimestamp();
      }

      const matchFoc = focUsages.find((f) => f.foc_storeId === store.st_id_Code);
      if (matchFoc) {
        forms.push("FOC");
        user_id = user_id || matchFoc.user_id;
        submittedAt = submittedAt || matchFoc._id.getTimestamp();
      }

      return {
        storeId: store.st_id_Code,
        storeName: store.st_store_Name,
        submitted: forms.length > 0,
        submittedBy: user_id,
        submittedAt,
        form_types: forms,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
