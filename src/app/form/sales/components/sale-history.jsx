"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SalesHistoryPage() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // โหลดยอดขายทั้งหมด + ข้อมูลผู้ใช้
  useEffect(() => {
    const fetchSales = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
      if (!userData) return;

      try {
        const res = await fetch(`/api/sales/get/get-all`);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setSales(data.sales || []);
      } catch (err) {
        console.error("❌ โหลดข้อมูลล้มเหลว:", err.message);
      }
    };

    fetchSales();
  }, []);

  // โหลดรายชื่อร้าน
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores/get/get-id-name-store");
        const data = await res.json();
        setStoreList(data.stores || []);
      } catch (err) {
        console.error("❌ โหลดรายชื่อร้านล้มเหลว:", err.message);
      }
    };

    fetchStores();
  }, []);

  // กรองข้อมูลตาม role, ร้าน, วันที่
  useEffect(() => {
    if (!user) return;

    const isAdmin = user.user_role === "admin";
    const allowedStores = user.user_storeId || [];

    const visibleSales = sales.filter((s) => {
      const isStoreAllowed = isAdmin
        ? selectedStoreId
          ? s.sal_storeId === selectedStoreId
          : true
        : allowedStores.includes(s.sal_storeId);

      const isDateInRange =
        (!startDate || new Date(s.sal_date) >= new Date(startDate)) &&
        (!endDate || new Date(s.sal_date) <= new Date(endDate));

      return isStoreAllowed && isDateInRange;
    });

    const sortedSales = [...visibleSales].sort((a, b) => {
      const dateA = new Date(a.sal_date);
      const dateB = new Date(b.sal_date);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      return a.sal_storeId.localeCompare(b.sal_storeId);
    });

    setFilteredSales(sortedSales);
  }, [sales, user, selectedStoreId, startDate, endDate]);

  const calculateTotal = (items) => {
    return items
      .filter((i) => i.sal_status === "มีขาย")
      .reduce((sum, i) => sum + (i.sal_quantity || 0) * (i.sal_unitPrice || 0), 0)
      .toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const getStoreName = (id) => {
    const store = storeList.find((s) => s.st_id_Code === id);
    return store ? `${store.st_id_Code} - ${store.st_store_Name}` : id;
  };

  const countItemsByStatus = (items) => {
    const summary = {
      "มีขาย": 0,
      "หมด": 0,
      "ไม่ขาย": 0,
    };

    items.forEach((i) => {
      if (summary[i.sal_status] !== undefined) {
        summary[i.sal_status]++;
      }
    });

    return summary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <Button variant="outline" onClick={() => router.push("/form")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>ประวัติการกรอกยอดขาย</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4 items-end">
            {user?.user_role === "admin" && (
              <div>
                <label className="text-sm font-semibold">กรองตามร้านค้า</label>
                <select
                  className="block mt-1 border rounded px-3 py-1"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                >
                  <option value="">-- แสดงทั้งหมด --</option>
                  {storeList.map((store) => (
                    <option key={store.st_id_Code} value={store.st_id_Code}>
                      {store.st_id_Code} - {store.st_store_Name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-semibold">จากวันที่</label>
              <input
                type="date"
                className="block mt-1 border rounded px-3 py-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold">ถึงวันที่</label>
              <input
                type="date"
                className="block mt-1 border rounded px-3 py-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

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
                {filteredSales.map((sale, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{sale.sal_date}</td>
                    <td className="p-2 border">{getStoreName(sale.sal_storeId)}</td>
                    <td className="p-2 border leading-tight">
                      <div className="text-xs mt-1 space-y-0.5">
                        <div className="flex items-center gap-1 text-green-600">
                          🟢 มีขาย: {countItemsByStatus(sale.sal_items)["มีขาย"]}
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          🔴 หมด: {countItemsByStatus(sale.sal_items)["หมด"]}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          ⚪️ ไม่ขาย: {countItemsByStatus(sale.sal_items)["ไม่ขาย"]}
                        </div>
                        <div>รวม: {sale.sal_items.length}</div>
                      </div>
                    </td>
                    <td className="p-2 border text-right text-green-700 font-semibold">
                      ฿ {calculateTotal(sale.sal_items)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {filteredSales.length === 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 p-4">
                      ยังไม่มีข้อมูลที่แสดง
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
