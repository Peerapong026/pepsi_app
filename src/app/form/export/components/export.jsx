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

  useEffect(() => {
    const fetchAll = async () => {
      const res1 = await fetch("/api/export/export-data");
      const res2 = await fetch("/api/export/get-meta-data");
      const json1 = await res1.json();
      const json2 = await res2.json();
      setRawData(json1);
      setMeta(json2);
    };
    fetchAll();
  }, []);

  const filterByDate = (items, dateKey) => {
    return items.filter(item => {
      const d = new Date(item[dateKey]);
      return (!dateRange.start || d >= new Date(dateRange.start)) && (!dateRange.end || d <= new Date(dateRange.end));
    });
  };

  const mapName = (id, type) => {
    if (type === "store") {
      return meta.stores.find(x => x.st_id_Code === id);
    } else if (type === "premium") {
      return meta.premiums.find(x => x.pm_id_premium === id || x._id === id || x.prem_id === id || x.gift_premiumId === id);
    } else if (type === "product") {
      return meta.products.find(x => x.sku_id === id);
    }
    return null;
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    if (selectedTypes.foc) {
      const focSheet = filterByDate(rawData.foc, "foc_date").map(item => {
      const store = mapName(item.foc_storeId, "store") || {};
      const premium = mapName(item.foc_premiumId, "premium") || {};
        return {
          storeId: item.foc_storeId,
          storeName: store.st_store_Name || "",
          premiumId: item.foc_premiumId,
          premiumName: premium.pm_name_premium || "",
          received: item.foc_received,
          used: item.foc_used,
          remain: item.foc_remaining,
          date: item.foc_date,
          userId: item.user_id
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(focSheet), "FOC");
    }

    if (selectedTypes.premium) {
      const preSheet = filterByDate(rawData.premium, "gift_date").map(item => {
        const store = mapName(item.gift_storeId, "store") || {};
        const premium = mapName(item.gift_premiumId, "premium") || {};
        return {
          storeId: store.st_id_Code || item.gift_storeId,
          storeName: store.st_store_Name || "",
          premiumId: item.gift_premiumId,
          premiumName: premium.pm_name_premium || premium.name || "",
          received: item.gift_received,
          used: item.gift_used,
          remain: item.gift_remaining,
          date: item.gift_date,
          userId: item.user_id
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(preSheet), "Premium");
    }

    if (selectedTypes.performance) {
      const perfSheet = filterByDate(rawData.performance, "per_date").map(item => {
        const store = mapName(item.per_storeId, "store") || {};
        return {
          storeId: store.storeId || item.per_storeId,
          storeName: store.st_store_Name || "",
          result: item.per_result,
          reason: item.per_reason,
          date: item.per_date,
          userId: item.user_id
        };
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perfSheet), "Performance");
    }

    if (selectedTypes.sales) {
      const saleSheet = filterByDate(rawData.sales, "sal_date").flatMap(sale => {
        const store = mapName(sale.sal_storeId, "store") || {};
        return sale.sal_items.map(item => {
          const sku = mapName(item.sal_skuId, "product") || {};
          return {
            storeId: store.storeId || sale.sal_storeId,
            storeName: store.st_store_Name || "",
            skuId: sku.skuId || item.sal_skuId,
            productName: sku.sku_name || "",
            skuCategory: sku.sku_category,
            status: item.sal_status,
            quantity: item.sal_quantity,
            unitPrice: item.sal_unitPrice,
            total: item.sal_totalPrice,
            date: sale.sal_date,
            userId: sale.user_id
          };
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saleSheet), "Sales");
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
              <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
            </div>
            <div>
              <Label>วันที่สิ้นสุด</Label>
              <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries({ foc: "FOC", premium: "Premium", performance: "Performance", sales: "Sales" }).map(([key, label]) => (
              <label key={key} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedTypes[key]}
                  onChange={(e) => setSelectedTypes(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <Button onClick={handleExport} className="w-full bg-green-600 hover:bg-green-700">
            Export เป็น Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
