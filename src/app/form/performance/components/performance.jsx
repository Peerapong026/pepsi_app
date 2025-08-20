"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Performance = () => {
  const [storeList, setStoreList] = useState([]);
  const [performance_records, setPerformanceRecords] = useState([]);
  const [premiumList, setPremiumList] = useState([]);
  const [userStoreId, setUserStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ state สำหรับโหมดแก้ไข
  const [editId, setEditId] = useState(null);

  const [performanceForm, setPerformanceForm] = useState({
    per_storeId: "",
    per_storeName: "",
    per_premiumId: "",
    per_premiumName: "",
    per_result: "",
    per_reason: "",
    per_quantity: "",
    per_date: new Date().toISOString().split("T")[0],
  });

  // โหลดร้าน
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores/get/get-id-name-store");
        const data = await res.json();
        const allStores = data.stores || [];
        const user = JSON.parse(localStorage.getItem("user"));
        const allowedStores = user?.user_storeId || [];
        const isAdmin = user?.user_role === "admin";
        const filtered = isAdmin ? allStores : allStores.filter((s) => allowedStores.includes(s.st_id_Code?.toString()));
        setStoreList(filtered);
      } catch (err) {
        toast.error("โหลดรายชื่อร้านไม่สำเร็จ", { description: err.message });
      }
    };
    fetchStores();
  }, []);

  // โหลด FOC
  useEffect(() => {
    const fetchFOC = async () => {
      try {
        const res = await fetch("/api/premium/get/get-sampling");
        const data = await res.json();
        setPremiumList(data.premiums || []);
      } catch (err) {
        toast.error("โหลดรายการ FOC ไม่สำเร็จ", { description: err.message });
      }
    };
    fetchFOC();
  }, []);

  // โหลด performance ตามร้าน+user
  const fetchPerformance = async (storeId) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.user_id) return;
    try {
      const res = await fetch(`/api/performance/get?storeId=${storeId}&user_id=${user.user_id}`);
      const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPerformanceRecords(json.data);
        } else {
          setPerformanceRecords([]);
        }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", { description: err.message });
    }
  };

  useEffect(() => {
    if (userStoreId) fetchPerformance(userStoreId);
  }, [userStoreId]);

  const boughtReasons = ["รสชาติดี", "ราคาเหมาะสม", "บรรจุภัณฑ์สวย", "แบรนด์มีชื่อเสียง", "โปรโมชั่นดี"];
  const notBoughtReasons = ["รสชาติไม่ถูกใจ", "ราคาแพง", "บรรจุภัณฑ์ไม่สวย", "ไม่รู้จักแบรนด์", "ไม่มีความต้องการ"];

  const getReasonOptions = () =>
    performanceForm.per_result === "ซื้อ" ? boughtReasons :
    performanceForm.per_result === "ไม่ซื้อ" ? notBoughtReasons : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const required = [
      { key: "per_storeId", label: "ร้านค้า" },
      { key: "per_premiumId", label: "สินค้า FOC ที่ชิม" },
      { key: "per_result", label: "ผลการชิม" },
      { key: "per_reason", label: "เหตุผล" },
      { key: "per_quantity", label: "จำนวน" },
      { key: "per_date", label: "วันที่" },
    ];
    for (const f of required) {
      const v = performanceForm[f.key];
      if (!v || v.toString().trim() === "") {
        toast.error("กรุณากรอกข้อมูลให้ครบ", { description: `กรุณาเลือกหรือกรอก: ${f.label}` });
        setIsSubmitting(false);
        return;
      }
    }

    const qty = parseInt(performanceForm.per_quantity || "0", 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("จำนวนต้องมากกว่า 0", { description: "กรอกจำนวนคนที่ชิมเป็นเลขจำนวนเต็มมากกว่า 0" });
      setIsSubmitting(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user?.user_id) {
      toast.error("ไม่พบผู้ใช้", { description: "กรุณาเข้าสู่ระบบใหม่" });
      setIsSubmitting(false);
      return;
    }

    // อัปเดตชื่อสินค้าจากรายการ
    const p = premiumList.find((x) => x.pm_id_premium === performanceForm.per_premiumId);
    const payload = {
      ...performanceForm,
      per_premiumName: p?.pm_name_premium || performanceForm.per_premiumName || "",
      per_quantity: qty,
      user_id: user.user_id,
      ...(editId ? { _id: editId } : {}),
    };

    try {
      const url = editId ? "/api/performance/edit" : "/api/performance/add";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "บันทึกไม่สำเร็จ");

      if (editId) {
        // แทนที่รายการที่แก้ไข
        setPerformanceRecords((prev) => prev.map((r) => (r._id === editId ? data.data : r)));
        toast.success("แก้ไขสำเร็จ");
        setEditId(null);
      } else {
        await fetchPerformance(performanceForm.per_storeId);
        toast.success("บันทึกสำเร็จ");
      }

      // เคลียร์ฟิลด์ (คงร้านและวันที่)
      setPerformanceForm((s) => ({
        ...s,
        per_premiumId: "",
        per_premiumName: "",
        per_result: "",
        per_reason: "",
        per_quantity: "",
      }));
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 ลบรายการ
  const handleDelete = async (id) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/performance/delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "ลบไม่สำเร็จ");
      setPerformanceRecords((prev) => prev.filter((r) => r._id !== id));
      toast.success("ลบข้อมูลสำเร็จ");
      if (editId === id) {
        setEditId(null);
        setPerformanceForm((s) => ({
          ...s,
          per_premiumId: "",
          per_premiumName: "",
          per_result: "",
          per_reason: "",
          per_quantity: "",
        }));
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", { description: err.message });
    }
  };

  const getBoughtCount = () =>
    performance_records.filter((r) => r.per_result === "ซื้อ").reduce((sum, r) => sum + (r.per_quantity || 0), 0);
  const getNotBoughtCount = () =>
    performance_records.filter((r) => r.per_result === "ไม่ซื้อ").reduce((sum, r) => sum + (r.per_quantity || 0), 0);
  const getTotalCount = () => performance_records.reduce((sum, r) => sum + (r.per_quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <BackButton to="/form" />
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Tracking</h1>
              <p className="text-gray-600">บันทึกผลการชิมสินค้า (ซื้อ/ไม่ซื้อ)</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold text-green-600">{getBoughtCount()}</p><p className="text-sm text-gray-600">ชิมแล้วซื้อ</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold text-red-600">{getNotBoughtCount()}</p><p className="text-sm text-gray-600">ชิมแล้วไม่ซื้อ</p></CardContent></Card>
          <Card><CardContent className="p-6 text-center"><p className="text-2xl font-bold text-purple-600">{getTotalCount()}</p><p className="text-sm text-gray-600">รวมทั้งหมด</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editId ? "แก้ไข Performance" : "บันทึก Performance"}
              </CardTitle>
              <CardDescription>บันทึกผลการชิมและเหตุผลในการตัดสินใจ</CardDescription>
            </CardHeader>
            <CardContent>
              {editId && (
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm mb-4">
                  กำลังแก้ไขข้อมูล ID: {editId}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Store */}
                <div>
                  <Label htmlFor="per_storeId">ร้านค้า</Label>
                  <Select
                    value={performanceForm.per_storeId}
                    onValueChange={(value) => {
                      const store = storeList.find((s) => String(s.st_id_Code) === value);
                      setUserStoreId(String(store?.st_id_Code || ""));
                      setPerformanceForm((prev) => ({
                        ...prev,
                        per_storeId: String(store?.st_id_Code || ""),
                        per_storeName: store?.st_store_Name || "",
                        per_premiumId: "",
                        per_premiumName: "",
                        per_result: "",
                        per_reason: "",
                        per_quantity: "",
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="เลือกร้านค้า" /></SelectTrigger>
                    <SelectContent>
                      {storeList.map((store) => (
                        <SelectItem key={store.st_id_Code} value={String(store.st_id_Code)}>
                          {store.st_id_Code} - {store.st_store_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FOC Product */}
                <div>
                  <Label htmlFor="per_premiumId">สินค้า FOC ที่ชิม</Label>
                  <Select
                    value={performanceForm.per_premiumId}
                    onValueChange={(value) => {
                      const p = premiumList.find((x) => x.pm_id_premium === value);
                      setPerformanceForm((prev) => ({
                        ...prev,
                        per_premiumId: value,
                        per_premiumName: p?.pm_name_premium || "",
                      }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="เลือกสินค้า FOC" /></SelectTrigger>
                    <SelectContent>
                      {premiumList.map((p) => (
                        <SelectItem key={p.pm_id_premium} value={p.pm_id_premium}>
                          {p.pm_id_premium} - {p.pm_name_premium}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="per_date">วันที่</Label>
                  <input
                    type="date"
                    id="per_date"
                    value={performanceForm.per_date}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, per_date: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  />
                </div>

                {/* Result */}
                <div>
                  <Label>การชิม</Label>
                  <RadioGroup
                    value={performanceForm.per_result}
                    onValueChange={(val) => setPerformanceForm((prev) => ({ ...prev, per_result: val, per_reason: "" }))}
                  >
                    <RadioGroupItem value="ซื้อ"   label={<span className="text-green-600 font-semibold">ชิมแล้วซื้อ</span>} />
                    <RadioGroupItem value="ไม่ซื้อ" label={<span className="text-red-600 font-semibold">ชิมแล้วไม่ซื้อ</span>} />
                  </RadioGroup>
                </div>

                {/* Reason + Quantity */}
                {performanceForm.per_result && (
                  <div>
                    <Label htmlFor="per_reason">เหตุผล</Label>
                    <Select
                      value={performanceForm.per_reason}
                      onValueChange={(value) => setPerformanceForm({ ...performanceForm, per_reason: value })}
                    >
                      <SelectTrigger><SelectValue placeholder="เลือกเหตุผล" /></SelectTrigger>
                      <SelectContent>
                        {getReasonOptions().map((reason, index) => (
                          <SelectItem key={index} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {performanceForm.per_reason && (
                      <div className="mt-3">
                        <Label htmlFor="per_quantity">จำนวน</Label>
                        <input
                          type="number"
                          id="per_quantity"
                          min="1"
                          placeholder="ระบุจำนวนคนที่ชิม"
                          value={performanceForm.per_quantity}
                          onChange={(e) => setPerformanceForm({ ...performanceForm, per_quantity: e.target.value })}
                          className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={
                      !performanceForm.per_storeId ||
                      !performanceForm.per_premiumId ||
                      !performanceForm.per_result ||
                      !performanceForm.per_reason ||
                      !performanceForm.per_quantity
                    }
                  >
                    {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                  </Button>

                  {editId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditId(null);
                        setPerformanceForm((s) => ({
                          ...s,
                          per_premiumId: "",
                          per_premiumName: "",
                          per_result: "",
                          per_reason: "",
                          per_quantity: "",
                        }));
                      }}
                    >
                      ยกเลิก
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Records */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>ประวัติ Performance</CardTitle>
              <CardDescription>รายการผลการชิมที่บันทึกไว้</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {performance_records.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล Performance</p>
                ) : (
                  performance_records.map((record, index) => (
                    <div key={record._id || record.per_id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">ร้าน: {record.per_storeId} - {record.per_storeName}</p>
                          {record.per_premiumId && (
                            <p className="text-sm text-gray-600">
                              สินค้าที่ชิม: {record.per_premiumId} - {record.per_premiumName}
                            </p>
                          )}
                          <p className={`text-sm font-semibold ${record.per_result === "ซื้อ" ? "text-green-600" : "text-red-600"}`}>
                            {record.per_result === "ซื้อ" ? "ชิมแล้วซื้อ" : "ชิมแล้วไม่ซื้อ"}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{record.per_date}</p>
                      </div>

                      <p className="text-sm text-gray-700 bg-white p-2 rounded mb-3">
                        <strong>เหตุผล:</strong> {record.per_reason} <br />
                        <strong>จำนวน:</strong> {record.per_quantity} คน
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => {
                            setEditId(record._id);
                            setPerformanceForm({
                              per_storeId: record.per_storeId,
                              per_storeName: record.per_storeName,
                              per_premiumId: record.per_premiumId || "",
                              per_premiumName: record.per_premiumName || "",
                              per_result: record.per_result,
                              per_reason: record.per_reason,
                              per_quantity: record.per_quantity?.toString() || "",
                              per_date: (record.per_date || "").toString().split("T")[0],
                            });
                            setUserStoreId(record.per_storeId);
                          }}
                        >
                          แก้ไข
                        </Button>

                        <Button
                          variant="destructive"
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete(record._id || record.per_id)}
                        >
                          ลบ
                        </Button>
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

export default Performance;
