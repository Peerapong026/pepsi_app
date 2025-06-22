"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ExportPage() {
  const [options, setOptions] = useState({
    foc: false,
    premium: false,
    performance: false,
    sales: false,
  });

  const dummyData = {
    foc: [
      { storeId: "ST001", premiumId: "PR001", received: 100, used: 45, date: "2025-06-10" },
    ],
    premium: [
      { storeId: "ST002", premiumId: "PR105", type: "เสื้อ", received: 50, used: 20, date: "2025-06-11" },
    ],
    performance: [
      { storeId: "ST003", date: "2025-06-12", result: "ซื้อ", reason: "โปรโมชั่นดี" },
    ],
    sales: [
      { storeId: "ST001", skuId: "SKU012", date: "2025-06-12", quantity: 10, unitPrice: 25, total: 250 },
    ]
  };

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();

    if (options.foc) {
      const sheet = XLSX.utils.json_to_sheet(dummyData.foc);
      XLSX.utils.book_append_sheet(workbook, sheet, "FOC");
    }

    if (options.premium) {
      const sheet = XLSX.utils.json_to_sheet(dummyData.premium);
      XLSX.utils.book_append_sheet(workbook, sheet, "Premium");
    }

    if (options.performance) {
      const sheet = XLSX.utils.json_to_sheet(dummyData.performance);
      XLSX.utils.book_append_sheet(workbook, sheet, "Performance");
    }

    if (options.sales) {
      const sheet = XLSX.utils.json_to_sheet(dummyData.sales);
      XLSX.utils.book_append_sheet(workbook, sheet, "Sales");
    }

    const file = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([file]), `report_export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="container py-10">
      <Card className="max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Export ข้อมูลเป็น Excel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {["foc", "premium", "performance", "sales"].map((key) => (
              <label key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={options[key]}
                  onChange={(val) => setOptions({ ...options, [key]: val })}
                />
                <span>
                  {key === "foc"
                    ? "FOC ของชิม"
                    : key === "premium"
                    ? "Premium ของแถม"
                    : key === "performance"
                    ? "ผลการชิม (Performance)"
                    : "ยอดขายสินค้า"}
                </span>
              </label>
            ))}
          </div>

          <Button onClick={handleExport} disabled={!Object.values(options).some(Boolean)} className="w-full bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" /> Export Excel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
