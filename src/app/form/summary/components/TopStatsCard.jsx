"use client";

import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

export default function TopStatsCard({ stats }) {
  const StatBox = ({ label, value, icon }) => (
    <Card className="p-4 rounded-xl shadow-sm bg-white border border-gray-100 hover:shadow-md transition">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <StatBox label="จำนวนร้าน" value={stats.totalStores || "-"} />
      <StatBox label="ยอดขายรวม (บาท)" value={stats.totalSales?.toLocaleString() || "0"} />
      <StatBox label="FOC ที่ใช้ (ชิ้น)" value={stats.totalFocUsed || "0"} />
      <StatBox label="Premium ที่ใช้ (ชิ้น)" value={stats.totalPremiumUsed || "0"} />
      <StatBox label="อัตราชิมแล้วซื้อ" value={stats.buyRate !== null ? `${stats.buyRate}%` : "-"} />
    </div>
  );
}
