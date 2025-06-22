// 📁 /app/form/sales/sales-history/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SalesHistoryPage() {
  const router = useRouter();
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) return;

      try {
        const res = await fetch(`/api/sales/get/get-by-user?user_id=${user.user_id}`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setSales(data.sales || []);
      } catch (err) {
        console.error("❌ โหลดข้อมูลล้มเหลว:", err.message);
      }
    };

    fetchSales();
  }, []);

  const calculateTotal = (items) => {
    return items
      .filter((i) => i.sal_status === "มีขาย")
      .reduce((sum, i) => sum + (i.sal_quantity || 0) * (i.sal_unitPrice || 0), 0)
      .toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <Button variant="outline" onClick={() => router.push("/form")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการกรอกยอดขายของคุณ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border bg-white shadow rounded-lg">
              <thead className="bg-orange-100">
                <tr>
                  <th className="p-2 border">วันที่</th>
                  <th className="p-2 border">ร้านค้า</th>
                  <th className="p-2 border">จำนวนรายการ</th>
                  <th className="p-2 border text-right">รวมเงินทั้งหมด</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{sale.sal_date}</td>
                    <td className="p-2 border">{sale.sal_storeId}</td>
                    <td className="p-2 border">{sale.sal_items.length}</td>
                    <td className="p-2 border text-right text-green-700 font-semibold">
                      ฿ {calculateTotal(sale.sal_items)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {sales.length === 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 p-4">
                      ยังไม่มีข้อมูลที่คุณเคยกรอกไว้
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
