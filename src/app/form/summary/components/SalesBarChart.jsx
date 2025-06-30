"use client";

import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

// ฟังก์ชันรวมยอดขายตามวันที่
function groupSalesByDate(sales = []) {
  const result = {};

  sales.forEach(sale => {
    const date = sale.sal_date;
    sale.sal_items.forEach(item => {
      const total = item.sal_totalPrice || 0;
      result[date] = (result[date] || 0) + total;
    });
  });

  // แปลงเป็น array พร้อม sort
  return Object.entries(result)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function SalesBarChart({ salesData = [] }) {
  const chartData = useMemo(() => groupSalesByDate(salesData), [salesData]);

  return (
    <Card className="rounded-xl shadow-md border border-gray-100 bg-white mb-6">
      <CardHeader>
        <CardTitle>ยอดขายรวมรายวัน</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-gray-500">ไม่มีข้อมูลยอดขาย</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} บาท`} />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
