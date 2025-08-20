"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SalesHistoryPage({ onEdit = null }) {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
        toast.error("โหลดประวัติยอดขายไม่สำเร็จ", { description: String(err.message) });
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
        toast.error("โหลดรายชื่อร้านไม่สำเร็จ", { description: String(err.message) });
      }
    };

    fetchStores();
  }, []);

  // กรองข้อมูลตาม role, ร้าน, วันที่
  useEffect(() => {
    if (!user) return;

    const isAdmin = user.user_role === "admin";
    const allowedStores = user.user_storeId || [];

    const endInclusive = endDate ? new Date(endDate + "T23:59:59.999") : null;

    const visibleSales = (sales || []).filter((s) => {
      const isStoreAllowed = isAdmin
        ? selectedStoreId
          ? s.sal_storeId === selectedStoreId
          : true
        : allowedStores.includes(String(s.sal_storeId));

      const d = new Date(s.sal_date);
      const isDateInRange =
        (!startDate || d >= new Date(startDate)) &&
        (!endDate || d <= endInclusive);

      return isStoreAllowed && isDateInRange;
    });

    const sortedSales = [...visibleSales].sort((a, b) => {
      const dateA = new Date(a.sal_date);
      const dateB = new Date(b.sal_date);
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      return String(a.sal_storeId).localeCompare(String(b.sal_storeId));
    });

    setFilteredSales(sortedSales);
  }, [sales, user, selectedStoreId, startDate, endDate]);

  const calculateTotal = (items) => {
    const n = (items || [])
      .filter((i) => i.sal_status === "มีขาย")
      .reduce((sum, i) => sum + (i.sal_quantity || 0) * (i.sal_unitPrice || 0), 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStoreName = (id) => {
    const store = storeList.find((s) => String(s.st_id_Code) === String(id));
    return store ? `${store.st_id_Code} - ${store.st_store_Name}` : id;
  };

  const countItemsByStatus = (items) => {
    const summary = { "มีขาย": 0, "หมด": 0, "ไม่ขาย": 0 };
    (items || []).forEach((i) => {
      if (summary[i.sal_status] !== undefined) summary[i.sal_status]++;
    });
    return summary;
  };

  const canManage = (sale) => {
    if (!user) return false;
    return user.user_role === "admin" || String(sale.user_id) === String(user.user_id);
  };

  // 👉 ไปหน้าแก้ไข (คุณเปลี่ยน path ได้ตามจริง)
  const handleEdit = (sale) => {
    const id = sale._id || sale.sal_id;
    if (!id) {
      toast.error("ไม่พบรหัสรายการสำหรับแก้ไข");
      return;
    }
    if (typeof onEdit === "function") {
      onEdit(sale);
      return;
    }
    router.push(`/sales/edit/${id}`);
    // หรือถ้าคุณใช้หน้าเดิม: router.push(`/form/sales?editId=${id}`);
  };

  // 🗑️ ลบรายการ
  const handleDelete = async (sale) => {
    const id = sale._id || sale.sal_id;
    if (!id) {
      toast.error("ไม่พบรหัสรายการสำหรับลบ");
      return;
    }
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/sales/delete?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "ลบไม่สำเร็จ");

      // เอาออกจาก state ทั้งสองกอง
      setSales((prev) => prev.filter((s) => (s._id || s.sal_id) !== id));
      setFilteredSales((prev) => prev.filter((s) => (s._id || s.sal_id) !== id));
      toast.success("ลบข้อมูลสำเร็จ");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดขณะลบ", { description: String(err.message) });
    } finally {
      setDeletingId(null);
    }
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
                  <th className="p-2 border text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, index) => {
                  const statusCount = countItemsByStatus(sale.sal_items);
                  return (
                    <tr key={sale._id || sale.sal_id || index}>
                      <td className="p-2 border">{sale.sal_date}</td>
                      <td className="p-2 border">{getStoreName(sale.sal_storeId)}</td>
                      <td className="p-2 border leading-tight">
                        <div className="text-xs mt-1 space-y-0.5">
                          <div className="flex items-center gap-1 text-green-600">
                            🟢 มีขาย: {statusCount["มีขาย"]}
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            🔴 หมด: {statusCount["หมด"]}
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            ⚪️ ไม่ขาย: {statusCount["ไม่ขาย"]}
                          </div>
                          <div>รวม: {sale.sal_items?.length || 0}</div>
                        </div>
                      </td>
                      <td className="p-2 border text-right text-green-700 font-semibold">
                        ฿ {calculateTotal(sale.sal_items || [])}
                      </td>
                      <td className="p-2 border">
                        {canManage(sale) ? (
                          <div className="flex gap-3 justify-center">
                            <Button
                              size="sm"
                              className="h-10 px-4 min-w-[88px] rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white whitespace-nowrap"
                              onClick={() => handleEdit(sale)}
                            >
                              แก้ไข
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-10 px-4 min-w-[88px] rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-60"
                              disabled={deletingId === (sale._id || sale.sal_id)}
                              onClick={() => handleDelete(sale)}
                            >
                              {deletingId === (sale._id || sale.sal_id) ? "กำลังลบ..." : "ลบ"}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-400">—</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filteredSales.length === 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 p-4">
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
