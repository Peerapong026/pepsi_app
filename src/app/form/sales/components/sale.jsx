"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SalesFullTablePage() {
  const router = useRouter();

  const [sal_date, setSalDate] = useState(new Date().toISOString().split("T")[0]);
  const [sal_storeId, setSalStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeList, setStoreList] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
  const fetchStores = async () => {
    const res = await fetch("/api/stores/get/get-id-name-store");
    const data = await res.json();
    const allStores = data.stores || [];
    const user = JSON.parse(localStorage.getItem("user"));
    const allowedStores = user?.user_storeId || [];
    const isAdmin = user?.user_role === "admin";

    const filteredStores = isAdmin
      ? allStores
      : allStores.filter((store) =>
          allowedStores.includes(store.st_id_Code.toString())
        );

    setStoreList(filteredStores);

    if (!isAdmin && filteredStores.length === 1) {
      setSalStoreId(filteredStores[0].st_id_Code);
      setStoreName(filteredStores[0].st_store_Name);
    }
  };

  const fetchSKUs = async () => {
    const res = await fetch("/api/products/get");
    const data = await res.json();
    const products = data.products || data;
    const sorted = [...products].sort((a, b) => a.sku_id.localeCompare(b.sku_id));
    setSkuList(sorted);
    setItems(
      sorted.map((sku) => ({
        sal_skuId: sku.sku_id,
        sal_status: "",
        sal_quantity: "",
        sal_unitPrice: "",
      }))
    );
  };

  fetchStores();
  fetchSKUs();
}, []);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "sal_status" && value !== "มีขาย") {
      updated[index].sal_quantity = "";
      updated[index].sal_unitPrice = "";
    }
    setItems(updated);
  };

  const calculateTotal = (q, p) => {
    const quantity = parseFloat(q || 0);
    const price = parseFloat(p || 0);
    return quantity * price;
  };

  const validateForm = () => {
    const errors = [];

    if (!sal_storeId || !sal_date) {
      errors.push("• กรุณาเลือกร้านและวันที่");
    }

    items.forEach((item, index) => {
      const sku = skuList.find((s) => s.sku_id === item.sal_skuId);
      const skuName = sku?.sku_name || item.sal_skuId;

      if (!item.sal_status) {
        errors.push(`• ${skuName} - ยังไม่ได้เลือกสถานะ`);
      } else if (item.sal_status === "มีขาย") {
        const qty = parseFloat(item.sal_quantity);
        const price = parseFloat(item.sal_unitPrice);

        if (!item.sal_quantity || qty <= 0) {
          errors.push(`• ${skuName} - จำนวนต้องมากกว่า 0`);
        }

        if (!item.sal_unitPrice || price <= 0) {
          errors.push(`• ${skuName} - ราคาต้องมากกว่า 0`);
        }
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const filteredItems = items
    .filter((item) => item.sal_status)
    .map((item) => ({
      ...item,
      sal_quantity: parseFloat(item.sal_quantity || 0),
      sal_unitPrice: parseFloat(item.sal_unitPrice || 0),
      sal_totalPrice: calculateTotal(item.sal_quantity, item.sal_unitPrice),
    }));

  const errors = validateForm();
    if (errors.length > 0) {
      toast.error("กรอกข้อมูลไม่ครบ", {
        description: errors.join("\n"),
        duration: 8000, // แสดงนานขึ้น
      });
      return;
    }

  const payload = {
    sal_storeId,
    sal_date,
    sal_items: filteredItems,
    user_id: JSON.parse(localStorage.getItem("user"))?.user_id,
  };

  try {
    const res = await fetch("/api/sales/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

    const result = await res.json();
    toast(
      <div>
        <p className="font-semibold">บันทึกสำเร็จ</p>
        <p className="text-sm text-muted-foreground">
          บันทึก {filteredItems.length} รายการยอดขายแล้ว
        </p>
      </div>
    );

    // reset
    setItems(
      skuList.map((sku) => ({
        sal_skuId: sku.sku_id,
        sal_status: "",
        sal_quantity: "",
        sal_unitPrice: "",
      }))
    );
  } catch (err) {
    toast(
      <div>
        <p className="font-semibold text-red-600">เกิดข้อผิดพลาด</p>
        <p className="text-sm text-muted-foreground">{err.message}</p>
      </div>
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <BackButton to="/form" />

      <Card>
        <CardHeader>
          <CardTitle>กรอกยอดขายสินค้า</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row md:space-x-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">เลือกร้าน</label>
                <Select
                  value={sal_storeId}
                  onValueChange={(value) => {
                    setSalStoreId(value);
                    const selected = storeList.find((s) => s.st_id_Code === value);
                    setStoreName(selected?.st_store_Name || "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกร้าน" />
                  </SelectTrigger>
                  <SelectContent>
                    {storeList.map((store) => (
                      <SelectItem key={store.st_id_Code} value={store.st_id_Code}>
                        {store.st_id_Code} - {store.st_store_Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1">วันที่ขาย</label>
                <Input type="date" value={sal_date} onChange={(e) => setSalDate(e.target.value)} required />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border mt-4 bg-white shadow rounded-lg">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="p-2 border">SKU</th>
                    <th className="p-2 border">ชื่อสินค้า</th>
                    <th className="p-2 border">สถานะ</th>
                    <th className="p-2 border">จำนวน</th>
                    <th className="p-2 border">ราคา/หน่วย</th>
                    <th className="p-2 border">รวม</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const sku = skuList.find((s) => s.sku_id === item.sal_skuId);
                    const showFields = item.sal_status === "มีขาย";
                    return (
                      <tr key={`${item.sal_skuId}-${index}`}>
                        <td className="p-2 border">{sku?.sku_id}</td>
                        <td className="p-2 border">{sku?.sku_name}</td>
                        <td className="p-2 border">
                          <Select
                            value={item.sal_status}
                            onValueChange={(val) => updateItem(index, "sal_status", val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="มีขาย">มีขาย</SelectItem>
                              <SelectItem value="หมด">หมด</SelectItem>
                              <SelectItem value="ไม่ขาย">ไม่ขาย</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 border">
                          {showFields && (
                            <Input
                              type="number"
                              placeholder="จำนวน"
                              value={item.sal_quantity}
                              onChange={(e) => updateItem(index, "sal_quantity", e.target.value)}
                            />
                          )}
                        </td>
                        <td className="p-2 border">
                          {showFields && (
                            <Input
                              type="number"
                              placeholder="ราคา"
                              value={item.sal_unitPrice}
                              onChange={(e) => updateItem(index, "sal_unitPrice", e.target.value)}
                            />
                          )}
                        </td>
                        <td className="p-2 border text-right font-semibold text-green-600">
                          {showFields
                            ? `฿${calculateTotal(item.sal_quantity, item.sal_unitPrice).toLocaleString()}`
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50 font-semibold">
                    <td colSpan={5} className="p-2 border text-right">รวมทั้งหมด</td>
                    <td className="p-2 border text-right text-green-700">
                      {items
                        .filter((i) => i.sal_status === "มีขาย")
                        .reduce((sum, i) => sum + calculateTotal(i.sal_quantity, i.sal_unitPrice), 0)
                        .toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="text-right">
              <Button
                type="submit"
                disabled={!validateForm()}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 text-lg rounded-md shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                บันทึกข้อมูลยอดขาย
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
