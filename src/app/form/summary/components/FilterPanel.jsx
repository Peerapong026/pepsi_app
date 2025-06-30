"use client";

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"; // ใช้ Select ของ shadcn

export default function FilterPanel({
  dateRange,
  setDateRange,
  selectedTypes,
  setSelectedTypes,
  storeList = [],
  selectedStoreId,
  setSelectedStoreId
}) {
  return (
    <Card className="border border-gray-200 shadow-sm rounded-xl bg-gray-50 mb-6">
      <CardHeader>
        {/* <CardTitle className="text-lg text-gray-700">เลือกข้อมูล</CardTitle> */}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="start-date">วันที่เริ่ม</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              max={new Date().toISOString().split("T")[0]} // ป้องกันเลือกเกินวันนี้
              onChange={(e) => {
                const newStart = e.target.value;
                setDateRange((prev) => ({
                  start: newStart,
                  end:
                    prev.end && newStart > prev.end
                      ? "" // เคลียร์ end-date ถ้า start ใหม่อยู่หลัง end เก่า
                      : prev.end,
                }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="end-date">วันที่สิ้นสุด</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              min={dateRange.start || undefined} // เลือกได้หลังจาก start-date
              max={new Date().toISOString().split("T")[0]} // จำกัดไม่เกินวันนี้
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="store">เลือกร้าน</Label>
          <Select
            value={selectedStoreId}
            onValueChange={(value) => setSelectedStoreId(value)}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="-- เลือกร้านทั้งหมด --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกร้าน</SelectItem>
              {storeList.map((store) => (
                <SelectItem key={store.st_id_Code} value={store.st_id_Code}>
                  {store.st_store_Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries({
            foc: "FOC",
            premium: "Premium",
            performance: "Performance",
            sales: "Sales"
          }).map(([key, label]) => (
            <label key={key} className="flex items-center space-x-2 text-sm text-gray-700">
              <Checkbox
                checked={selectedTypes[key]}
                onChange={(e) =>
                  setSelectedTypes((prev) => ({
                    ...prev,
                    [key]: e.target.checked
                  }))
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
