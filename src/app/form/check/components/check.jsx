"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../../../components/ui/select";
import { format } from "date-fns";

export default function SupCheckPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [submissionData, setSubmissionData] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
        try {
        // ✅ เปลี่ยนจากเรียกเฉพาะร้านที่ SUP ดูแล → เรียกทุกร้าน
        const res = await fetch(`/api/stores/get/get-id-name-store`);
        const data = await res.json();
        setStoreList(data.stores || []);
        } catch (err) {
        console.error("โหลดร้านล้มเหลว", err);
        }
    };
    fetchStores();
    }, []);

  const fetchSubmissionStatus = async () => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        const params = new URLSearchParams({
        date,
        sup_id: user?.user_id,
        });

        if (selectedStore !== "all") {
        params.append("store_id", selectedStore);
        }

        const url = `/api/check/check-submissions?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        setSubmissionData(data.data || []);
    } catch (err) {
        console.error("โหลดสถานะล้มเหลว", err);
    }
    };

  useEffect(() => {
    if (date) fetchSubmissionStatus();
  }, [date, selectedStore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <Card>
        <CardHeader>
          <CardTitle>ตรวจสอบการส่งงานพนักงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-col">
              <Label>วันที่</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Label>เลือกร้าน</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="เลือกร้าน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">แสดงทั้งหมด</SelectItem>
                  {storeList.map((store) => (
                    <SelectItem key={store.st_id_Code} value={store.st_id_Code}>
                      {store.st_id_Code} - {store.st_store_Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border bg-white shadow-sm rounded-lg text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-2 border">ร้านค้า</th>
                  <th className="p-2 border">ผู้ส่ง</th>
                  <th className="p-2 border">ประเภทฟอร์ม</th>
                  <th className="p-2 border">เวลาที่ส่ง</th>
                </tr>
              </thead>
              <tbody>
                {submissionData.map((row, i) => (
                  <tr key={i} className={row.submitted ? "" : "bg-red-50"}>
                    <td className="p-2 border">{row.storeName}</td>
                    <td className="p-2 border">{row.submittedBy || "ยังไม่ส่ง"}</td>
                    <td className="p-2 border">
                      {row.form_types?.length > 0 ? row.form_types.join(", ") : "-"}
                    </td>
                    <td className="p-2 border">
                      {row.submittedAt ? format(new Date(row.submittedAt), "HH:mm น.") : "-"}
                    </td>
                  </tr>
                ))}
                {submissionData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 p-4">
                      ไม่พบข้อมูลการส่งงานในวันนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
