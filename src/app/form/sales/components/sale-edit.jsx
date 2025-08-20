"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";

export default function SaleEdit({ saleId, onCancel, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeList, setStoreList] = useState([]);
  const [sale, setSale] = useState({
    _id: "",
    sal_storeId: "",
    sal_date: "",
    sal_items: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const rStore = await fetch("/api/stores/get/get-id-name-store");
        const jStore = await rStore.json();
        setStoreList(jStore.stores || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!saleId) return;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/sales/get/get-by-id?id=${saleId}`);
        const j = await r.json();
        if (!j.success || !j.data) throw new Error(j.message || "ไม่พบข้อมูล");
        const d = j.data;
        setSale({
          _id: d._id || saleId,
          sal_storeId: String(d.sal_storeId ?? ""),
          sal_date: (d.sal_date || "").toString().split("T")[0],
          sal_items: (d.sal_items || []).map((it) => ({
            sal_skuId: String(it.sal_skuId ?? ""),
            sal_skuName: String(it.sal_skuName ?? ""),
            sal_status: it.sal_status ?? "มีขาย",
            sal_quantity: Number(it.sal_quantity ?? 0),
            sal_unitPrice: Number(it.sal_unitPrice ?? 0),
            sal_totalPrice: Number(it.sal_totalPrice ?? (Number(it.sal_quantity||0)*Number(it.sal_unitPrice||0))),
          })),
        });
      } catch (e) {
        toast.error("โหลดรายการไม่สำเร็จ", { description: String(e) });
        onCancel?.();
      } finally {
        setLoading(false);
      }
    })();
  }, [saleId, onCancel]);

  const storeName = (sid) => {
    const s = storeList.find((x) => String(x.st_id_Code) === String(sid));
    return s ? `${s.st_id_Code} - ${s.st_store_Name}` : sid;
  };

  const totalAll = useMemo(
    () => sale.sal_items.reduce((sum, i) => sum + (i.sal_quantity||0) * (i.sal_unitPrice||0), 0),
    [sale.sal_items]
  );

  const updateItem = (idx, key, value) => {
    setSale((prev) => {
      const items = [...prev.sal_items];
      const row = { ...items[idx] };
      if (key === "sal_quantity" || key === "sal_unitPrice") {
        row[key] = Number(value);
        row.sal_totalPrice = (row.sal_quantity||0) * (row.sal_unitPrice||0);
      } else if (key === "sal_status") {
        row.sal_status = value;
      }
      items[idx] = row;
      return { ...prev, sal_items: items };
    });
  };

  const removeRow = (idx) => {
    setSale((prev) => {
      const items = [...prev.sal_items];
      items.splice(idx, 1);
      return { ...prev, sal_items: items };
    });
  };

  const handleSave = async () => {
    if (!sale.sal_storeId || !sale.sal_date || sale.sal_items.length === 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/sales/edit?id=${sale._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sal_storeId: sale.sal_storeId,
          sal_date: sale.sal_date,
          sal_items: sale.sal_items,
        }),
      });
      const j = await res.json();
      if (!j.success) throw new Error(j.message || "บันทึกไม่สำเร็จ");
      toast.success("บันทึกการแก้ไขสำเร็จ");
      onSaved?.(); // ให้หน้าแม่สลับแท็บ + refresh
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด", { description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">กำลังโหลด...</div>;

  return (
    <Card className="shadow">
      <CardHeader>
        <CardTitle>แก้ไขยอดขาย #{sale._id?.slice(-6)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>ร้านค้า</Label>
            <div className="w-full border rounded px-3 py-2 mt-1 bg-gray-50">{storeName(sale.sal_storeId)}</div>
          </div>
          <div>
            <Label>วันที่</Label>
            <Input type="date" value={sale.sal_date} onChange={(e) => setSale({ ...sale, sal_date: e.target.value })} />
          </div>
          <div className="flex items-end justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-600">รวมทั้งหมด</div>
              <div className="text-2xl font-bold text-green-600">
                ฿ {totalAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border bg-white shadow rounded-lg">
            <thead className="bg-orange-100">
              <tr>
                <th className="p-2 border">สินค้า (SKU)</th>
                <th className="p-2 border">สถานะ</th>
                <th className="p-2 border text-right">จำนวน</th>
                <th className="p-2 border text-right">ราคาต่อหน่วย</th>
                <th className="p-2 border text-right">รวม</th>
                {/* <th className="p-2 border text-center">จัดการ</th> */}
              </tr>
            </thead>
            <tbody>
              {sale.sal_items.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">
                    <div className="px-2 py-1 border rounded bg-gray-50">
                      {row.sal_skuId}{row.sal_skuName ? ` - ${row.sal_skuName}` : ""}
                    </div>
                  </td>
                  <td className="p-2 border">
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={row.sal_status}
                      onChange={(e) => updateItem(idx, "sal_status", e.target.value)}
                    >
                      <option value="มีขาย">มีขาย</option>
                      <option value="หมด">หมด</option>
                      <option value="ไม่ขาย">ไม่ขาย</option>
                    </select>
                  </td>
                  <td className="p-2 border">
                    <Input type="number" min="0" className="text-right" value={row.sal_quantity}
                           onChange={(e) => updateItem(idx, "sal_quantity", e.target.value)} />
                  </td>
                  <td className="p-2 border">
                    <Input type="number" min="0" step="0.01" className="text-right" value={row.sal_unitPrice}
                           onChange={(e) => updateItem(idx, "sal_unitPrice", e.target.value)} />
                  </td>
                  <td className="p-2 border text-right">
                    ฿ {(row.sal_totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {/* <td className="p-2 border text-center">
                    <Button size="sm" variant="destructive"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => removeRow(idx)}>
                      ลบแถว
                    </Button>
                  </td> */}
                </tr>
              ))}
            </tbody>
            {sale.sal_items.length === 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">ไม่มีรายการสินค้าในบิลนี้</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onCancel?.()} className="h-10 px-4 min-w-[88px] rounded-lg bg-red-600 hover:bg-red-700 text-white">ยกเลิก</Button>
          <Button onClick={handleSave} disabled={saving} className="h-10 px-4 min-w-[88px] rounded-lg bg-green-600 hover:bg-green-700">
            {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
