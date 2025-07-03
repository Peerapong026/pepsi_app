"use client";

import { useState,useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ArrowLeft, Plus, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PremiumUsage = () => {
  const router = useRouter();
  const [storeList, setStoreList] = useState([]);
  const [premiumList, setPremiumList] = useState([]);
  const [records, setRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gift_storeId: "",
    gift_premiumId: "",
    gift_promotionId: "",
    gift_received: "",
    gift_used: "",
    gift_date: new Date().toISOString().split("T")[0],
  });
    
  useEffect(() => {
    const fetchStores = async () => {
      const res = await fetch("/api/stores/get/get-id-name-store");
      const data = await res.json();
      const allStores = data.stores || [];
      const user = JSON.parse(localStorage.getItem("user"));
      const allowedStores = user?.user_storeId || [];
      const isAdmin = user?.user_role === "admin";

      // ✅ ถ้า admin → เห็นทั้งหมด, ถ้า member → filter ตามสิทธิ์
      const filteredStores = isAdmin
        ? allStores
        : allStores.filter((store) =>
            allowedStores.includes(store.st_id_Code.toString())
          );
          setStoreList(filteredStores);
          };

          fetchStores();
        }, []);

  useEffect(() => {
    const fetchPremiums = async () => {
      const res = await fetch("/api/premium/get/get-premium");
      const data = await res.json();
      setPremiumList(data.premiums || []);
    };
    fetchPremiums();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const storeId = formData.gift_storeId;
        if (!storeId) return; // ยังไม่เลือกร้าน ไม่ต้องโหลด

        const res = await fetch(`/api/premium/get/get-usage?storeId=${storeId}`);
        const data = await res.json();

        if (data.success) {
          setRecords(data.data);
        } else {
          toast.error("เกิดข้อผิดพลาด", { description: json.message || "ไม่สามารถโหลดข้อมูลได้" });
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาด", { description: err.message });
      }
    };

    fetchRecords();
  }, [formData.gift_storeId]); // 🔁 รันใหม่ทุกครั้งที่เลือกร้าน


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const received = parseFloat(formData.gift_received);
    const used = parseFloat(formData.gift_used);

    // 🔒 ตรวจสอบยอดใช้ไม่เกินยอดคงเหลือสะสม
    const remainingBefore = getRemainingNow();
    if (used > remainingBefore + received) {
      toast.error("ใช้เกินยอดที่มีอยู่", {
        description: `คุณใช้ไป ${used} ชิ้น แต่ยอดคงเหลือมีอยู่เพียง ${remainingBefore + received} ชิ้น`,
      });
      setIsSubmitting(false);
      return;
    }

    // ดำเนินการบันทึกต่อ...
    const previousRecords = records.filter(
      (r) =>
        r.gift_storeId === formData.gift_storeId &&
        r.gift_premiumId === formData.gift_premiumId
    );

    const totalPrevReceived = previousRecords.reduce((sum, r) => sum + r.gift_received, 0);
    const totalPrevUsed = previousRecords.reduce((sum, r) => sum + r.gift_used, 0);
    const remaining = totalPrevReceived + received - (totalPrevUsed + used);

    const newRecord = {
      gift_storeId: formData.gift_storeId,
      gift_premiumId: formData.gift_premiumId,
      gift_promotionId: formData.gift_promotionId,
      gift_received: received,
      gift_used: used,
      gift_remaining: remaining,
      gift_date: formData.gift_date,
      user_id: user.user_id,
    };

    try {
      const res = await fetch("/api/premium/add-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      const data = await res.json();
      if (data.success) {
        setRecords([...records, data.data]);
        toast.success("บันทึกสำเร็จ", { description: "ข้อมูลถูกบันทึกแล้ว" });
      } else {
        throw new Error(data.error);
      }

      setFormData({
        gift_storeId: "",
        gift_premiumId: "",
        gift_promotionId: "",
        gift_received: "",
        gift_used: "",
        gift_date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
    };

    const getRemainingNow = () => {
    const previous = records.filter(
      (r) =>
        r.gift_storeId === formData.gift_storeId &&
        r.gift_premiumId === formData.gift_premiumId
    );

    const totalPrevReceived = previous.reduce((sum, r) => sum + r.gift_received, 0);
    const totalPrevUsed = previous.reduce((sum, r) => sum + r.gift_used, 0);

    return totalPrevReceived - totalPrevUsed;
  };

    const getStoreName = (storeId) => {
      const store = storeList.find((s) => s.st_id_Code === storeId);
      return store ? store.st_store_Name : "";
    };

    const getPremiumName = (premiumId) => {
    const p = premiumList.find(p => p.pm_id_premium === premiumId);
    return p ? p.pm_name_premium : "";
  };

    const filteredRecords = formData.gift_storeId
    ? records.filter((r) => {
        const sameStore = r.gift_storeId === formData.gift_storeId;
        const samePremium = formData.gift_premiumId
          ? r.gift_premiumId === formData.gift_premiumId
          : true; // ถ้ายังไม่เลือก premium ให้แสดงทั้งหมดของร้าน
        return sameStore && samePremium;
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
            <BackButton to="/form" />
          <div className="flex items-center">
            <Gift className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">การใช้ Premium ของแถม</h1>
              <p className="text-gray-600">จัดการการรับและใช้ของแถม Premium</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                บันทึกการใช้ Premium
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลการรับและใช้ของแถม Premium ในแต่ละวัน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="gift_storeId">รหัสร้านค้า</Label>
                  <Select value={formData.gift_storeId} onValueChange={(value) => setFormData({ ...formData, gift_storeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกร้านค้า" />
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

                <div>
                  <Label htmlFor="gift_premiumId">รหัสสินค้า Premium</Label>
                  <Select value={formData.gift_premiumId} onValueChange={(value) => setFormData({ ...formData, gift_premiumId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสินค้า Premium" />
                    </SelectTrigger>
                    <SelectContent>
                      {premiumList.map((p) => (
                        <SelectItem key={p.pm_id_premium} value={p.pm_id_premium}>
                          {p.pm_id_premium} - {p.pm_name_premium}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.gift_storeId && formData.gift_premiumId && (
                    <div className="text-sm text-blue-600 mt-1">
                      คงเหลือปัจจุบัน:{" "}
                      <span className="font-bold">{getRemainingNow().toLocaleString()}</span> ชิ้น
                    </div>
                  )}
                </div>

                {/* <div>
                  <Label htmlFor="gift_promotionId">รหัสโปรโมชั่น</Label>
                  <Select value={formData.gift_promotionId} onValueChange={(value) => setFormData({ ...formData, gift_promotionId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกโปรโมชั่น" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PT001">PT001 - โปรโมชั่นฤดูร้อน</SelectItem>
                      <SelectItem value="PT002">PT002 - โปรโมชั่นปีใหม่</SelectItem>
                      <SelectItem value="PT003">PT003 - โปรโมชั่นพิเศษ</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <div>
                  <Label htmlFor="gift_received">จำนวนที่รับจากโกดัง</Label>
                  <Input id="gift_received" type="number" value={formData.gift_received} onChange={(e) => setFormData({ ...formData, gift_received: e.target.value })} placeholder="กรอกจำนวนที่รับ" required />
                </div>

                <div>
                  <Label htmlFor="gift_used">จำนวนที่ใช้ไป</Label>
                  <Input id="gift_used" type="number" value={formData.gift_used} onChange={(e) => setFormData({ ...formData, gift_used: e.target.value })} placeholder="กรอกจำนวนที่ใช้" required />
                </div>

                <div>
                  <Label htmlFor="gift_date">วันที่ใช้</Label>
                  <Input id="gift_date" type="date" value={formData.gift_date} onChange={(e) => setFormData({ ...formData, gift_date: e.target.value })} required />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-green-600 hover:bg-green-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>ประวัติการใช้ Premium</CardTitle>
              <CardDescription>รายการการใช้ของแถม Premium ที่บันทึกไว้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {records.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลการใช้ Premium</p>
                ) : (
                  filteredRecords.map((record,index) => (
                    <div key={record.id|| record.gift_id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">ร้าน: {record.gift_storeId} - {getStoreName(record.gift_storeId)}</p>
                          <p className="text-sm text-gray-600">สินค้า: {record.gift_premiumId} - {getPremiumName(record.gift_premiumId)}</p>
                          {/* <p className="text-sm text-gray-600">โปรโมชั่น: {record.gift_promotionId}</p> */}
                        </div>
                        <p className="text-sm text-gray-500">{record.gift_date}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">รับมา</p>
                          <p className="font-semibold text-green-600">{record.gift_received}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ใช้ไป</p>
                          <p className="font-semibold text-red-600">{record.gift_used}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">คงเหลือ</p>
                          <p className="font-semibold text-blue-600">{record.gift_remaining}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumUsage;
