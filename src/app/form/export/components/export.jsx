"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ExportPage() {
  const [rawData, setRawData] = useState({ foc: [], premium: [], performance: [], sales: [] });
  const [meta, setMeta] = useState({ stores: [], products: [], premiums: [] });
  const [selectedTypes, setSelectedTypes] = useState({ foc: false, premium: false, performance: false, sales: false });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [r1, r2] = await Promise.all([
          fetch("/api/export/export-data"),
          fetch("/api/export/get-meta-data"),
        ]);
        const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
        setRawData(j1.data ?? j1);   // รองรับทั้ง { success, data } และ json ตรง ๆ
        setMeta(j2.data ?? j2);
      } catch (err) {
        toast.error("ดึงข้อมูล export ไม่สำเร็จ", { description: String(err) });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filterByDate = (items, dateKey) => {
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end   = dateRange.end   ? new Date(dateRange.end)   : null;
    if (end) end.setHours(23, 59, 59, 999); // รวมทั้งวันสุดท้าย
    return items.filter(item => {
      const d = new Date(item[dateKey]);
      return (!start || d >= start) && (!end || d <= end);
    });
  };

  const mapName = (id, type) => {
    const key = id != null ? String(id) : "";
    if (type === "store") {
      return meta.stores.find(x => String(x.st_id_Code) === key);
    } else if (type === "premium") {
      return meta.premiums.find(
        x =>
          String(x.pm_id_premium) === key ||
          String(x._id) === key ||
          String(x.prem_id) === key ||
          String(x.gift_premiumId) === key
      );
    } else if (type === "product") {
      return meta.products.find(x => String(x.sku_id) === key);
    }
    return null;
  };

  // helper: แปะชีตด้วย header + ความกว้างคอลัมน์ (อ่านง่ายใน Excel)
  const appendSheet = (wb, rows, name, header, widths) => {
    const ws = XLSX.utils.json_to_sheet(rows, header ? { header } : undefined);
    if (Array.isArray(widths)) {
      ws["!cols"] = widths.map(wch => ({ wch }));
    }
    XLSX.utils.book_append_sheet(wb, ws, name);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    if (selectedTypes.foc) {
      const focSheet = filterByDate(rawData.foc, "foc_date").map(item => {
        const store = mapName(item.foc_storeId, "store") || {};
        const premium = mapName(item.foc_premiumId, "premium") || {};
        return {
          storeId: item.foc_storeId ?? "",
          storeName: store.st_store_Name ?? "",
          premiumId: item.foc_premiumId ?? "",
          premiumName: premium.pm_name_premium ?? "",
          received: item.foc_received ?? 0,
          used: item.foc_used ?? 0,
          remain: item.foc_remaining ?? 0,
          date: item.foc_date ?? "",
          userId: item.user_id ?? "",
        };
      });
      appendSheet(
        wb,
        focSheet,
        "FOC",
        ["storeId","storeName","premiumId","premiumName","received","used","remain","date","userId"],
        [10, 24, 12, 24, 10, 10, 10, 12, 14]
      );
    }

    if (selectedTypes.premium) {
      const preSheet = filterByDate(rawData.premium, "gift_date").map(item => {
        const store = mapName(item.gift_storeId, "store") || {};
        const premium = mapName(item.gift_premiumId, "premium") || {};
        return {
          storeId: store.st_id_Code ?? item.gift_storeId ?? "",
          storeName: store.st_store_Name ?? "",
          premiumId: item.gift_premiumId ?? "",
          premiumName: premium.pm_name_premium ?? premium.name ?? "",
          received: item.gift_received ?? 0,
          used: item.gift_used ?? 0,
          remain: item.gift_remaining ?? 0,
          date: item.gift_date ?? "",
          userId: item.user_id ?? "",
        };
      });
      appendSheet(
        wb,
        preSheet,
        "Premium",
        ["storeId","storeName","premiumId","premiumName","received","used","remain","date","userId"],
        [10, 24, 12, 24, 10, 10, 10, 12, 14]
      );
    }

    if (selectedTypes.performance) {
      const perfSheet = filterByDate(rawData.performance, "per_date").map(item => {
        const store = mapName(item.per_storeId, "store") || {};
        const premium = item.per_premiumId ? mapName(item.per_premiumId, "premium") || {} : {};
        return {
          storeId: store.st_id_Code ?? item.per_storeId ?? "",
          storeName: store.st_store_Name ?? "",
          premiumId: item.per_premiumId ?? "",
          premiumName: item.per_premiumName ?? premium.pm_name_premium ?? "",
          result: item.per_result ?? "",
          reason: item.per_reason ?? "",
          date: item.per_date ?? "",
          userId: item.user_id ?? "",
        };
      });
      appendSheet(
        wb,
        perfSheet,
        "Performance",
        ["storeId","storeName","premiumId","premiumName","result","reason","date","userId"],
        [10, 24, 12, 24, 10, 24, 12, 14]
      );
    }

    if (selectedTypes.sales) {
      const saleSheet = filterByDate(rawData.sales, "sal_date").flatMap(sale => {
        const store = mapName(sale.sal_storeId, "store") || {};
        const items = Array.isArray(sale.sal_items) ? sale.sal_items : [];
        return items.map(item => {
          const sku = mapName(item.sal_skuId, "product") || {};
          return {
            storeId: store.st_id_Code ?? sale.sal_storeId ?? "",
            storeName: store.st_store_Name ?? "",
            skuId: sku.sku_id ?? item.sal_skuId ?? "",
            productName: sku.sku_name ?? "",
            skuCategory: sku.sku_category ?? "",
            status: item.sal_status ?? "",
            quantity: item.sal_quantity ?? 0,
            unitPrice: item.sal_unitPrice ?? 0,
            total: item.sal_totalPrice ?? 0,
            date: sale.sal_date ?? "",
            userId: sale.user_id ?? "",
          };
        });
      });
      appendSheet(
        wb,
        saleSheet,
        "Sales",
        ["storeId","storeName","skuId","productName","skuCategory","status","quantity","unitPrice","total","date","userId"],
        [10, 24, 12, 28, 16, 12, 10, 12, 12, 12, 14]
      );
    }

    if (wb.SheetNames.length === 0) {
      toast.error("กรุณาเลือกประเภทข้อมูลอย่างน้อย 1 อย่าง");
      return;
    }

    XLSX.writeFile(wb, `export_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("ส่งออกไฟล์ Excel สำเร็จ");
  };

  return (
    <div className="container py-10">
      <div className="flex items-center mb-8 px-4">
        <BackButton to="/form" />
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Export ข้อมูล</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>วันที่เริ่ม</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <Label>วันที่สิ้นสุด</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries({ foc: "FOC", premium: "Premium", performance: "Performance", sales: "Sales" }).map(
              ([key, label]) => (
                <label key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedTypes[key]}
                    onChange={(e) =>
                      setSelectedTypes(prev => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              )
            )}
          </div>

          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "กำลังโหลดข้อมูล..." : "Export เป็น Excel"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
