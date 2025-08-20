"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

export default function MySubmissionsPage() {
  const [tab, setTab] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [focData, setFocData] = useState([]);
  const [premiumData, setPremiumData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [meta, setMeta] = useState({
    stores: [],
    premiums: [],
    products: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) return;

      const query = `user_id=${user.user_id}&role=${user.user_role}`;

      const [salesRes, focRes, premiumRes, performanceRes, storeRes, premiumMetaRes] = await Promise.all([
        fetch(`/api/edit/edit-by-user?type=sale&${query}`),
        fetch(`/api/edit/edit-by-user?type=foc&${query}`),
        fetch(`/api/edit/edit-by-user?type=premium&${query}`),
        fetch(`/api/edit/edit-by-user?type=performance&${query}`),
        fetch(`/api/stores/get/get-id-name-store`),
        fetch(`/api/premium/get/get-id-name-premium`)
      ]);

      const [sales, foc, premium, performance, stores, premiums] = await Promise.all([
        salesRes.ok ? salesRes.json() : { data: [] },
        focRes.ok ? focRes.json() : { data: [] },
        premiumRes.ok ? premiumRes.json() : { data: [] },
        performanceRes.ok ? performanceRes.json() : { data: [] },
        storeRes.ok ? storeRes.json() : { data: [] },
        premiumMetaRes.ok ? premiumMetaRes.json() : { data: [] }
      ]);

      setSalesData(sales.data || []);
      setFocData(foc.data || []);
      setPremiumData(premium.data || []);
      setPerformanceData(performance.data || []);
      setMeta({
        stores: stores.data || [],
        premiums: premiums.data || [],
        products: [] // ถ้ามี sal_skuId ก็เพิ่มในอนาคต
      });
    };

    fetchData();
  }, []);

  const getStoreName = (id) => {
    const store = meta.stores.find((s) => s.st_id_Code === id);
    return store ? store.st_store_Name : id;
  };

  const getPremiumName = (id) => {
    const premium = meta.premiums.find((p) => p.pm_id === id);
    return premium ? premium.pm_name : id;
  };

  const handleEdit = (type, record) => {
    // กดแก้ไข → ส่งไปหน้าที่เกี่ยวข้องพร้อมพารามิเตอร์
    location.href = `/form/${type}/edit?id=${record._id}`;
  };

  const handleDelete = async (type, id) => {
    if (!confirm("ยืนยันการลบข้อมูลนี้?")) return;
    try {
      const res = await fetch(`/api/${type}/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      toast.success("ลบข้อมูลสำเร็จ");
      location.reload();
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", { description: err.message });
    }
  };

  const renderTable = (data, type) => (
    <div className="overflow-auto max-h-[500px]">
      {data.length === 0 ? (
        <p className="text-gray-500 py-6 text-center">ไม่มีข้อมูล</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">วันที่</th>
              {type === "sales" && <th className="border p-2">รายการสินค้า</th>}
              {type === "foc" && <th className="border p-2">ของชิม</th>}
              {type === "premium" && <th className="border p-2">ของแถม</th>}
              {type === "performance" && <th className="border p-2">ผลการชิม</th>}
              <th className="border p-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r._id} className="odd:bg-white even:bg-gray-50">
                <td className="border p-2 whitespace-nowrap">
                  {r.sal_date || r.foc_date || r.gift_date || r.per_date || "-"}
                </td>
                <td className="border p-2">
                  {type === "sales" && r.sal_items?.map(item => (
                    <div key={item.sal_skuId}>
                      <div>SKU: {item.sal_skuId}</div>
                      <div>สถานะ: {item.sal_status}</div>
                      <hr className="my-1" />
                    </div>
                  ))}
                  {type === "foc" && (
                    <div>
                      <div>Store: {getStoreName(r.foc_storeId)}</div>
                      <div>Premium ID: {getPremiumName(r.foc_premiumId)}</div>
                      <div>รับเข้า: {r.foc_received} ใช้: {r.foc_used} เหลือ: {r.foc_remaining}</div>
                    </div>
                  )}
                  {type === "premium" && (
                    <div>
                      <div>Store: {getStoreName(r.gift_storeId)}</div>
                      <div>Premium ID: {getPremiumName(r.gift_premiumId)}</div>
                      <div>รับเข้า: {r.gift_received} ใช้: {r.gift_used} เหลือ: {r.gift_remaining}</div>
                    </div>
                  )}
                  {type === "performance" && (
                    <div>
                      <div>ผล: {r.per_result}</div>
                      <div>จำนวน: {r.per_quantity}</div>
                      <div>เหตุผล: {r.per_reason}</div>
                    </div>
                  )}
                </td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(type, r)}>
                      <Pencil className="w-4 h-4 mr-1" /> แก้ไข
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(type, r._id)}>
                      <Trash className="w-4 h-4 mr-1" /> ลบ
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>ประวัติการกรอกข้อมูลทั้งหมดของคุณ</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList>
              <TabsTrigger value="foc">FOC ของชิม</TabsTrigger>
              <TabsTrigger value="premium">ของแถม</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="sales">ยอดขาย</TabsTrigger>
            </TabsList>

            <TabsContent value="foc">{renderTable(focData, "foc")}</TabsContent>
            <TabsContent value="premium">{renderTable(premiumData, "premium")}</TabsContent>
            <TabsContent value="performance">{renderTable(performanceData, "performance")}</TabsContent>
            <TabsContent value="sales">{renderTable(salesData, "sales")}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
