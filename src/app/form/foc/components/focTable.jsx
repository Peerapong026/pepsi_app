"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ArrowLeft, Plus, Package, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FOCUsage = () => {
  const router = useRouter();
  const [storeList, setStoreList] = useState([]);
  const [premiumList, setPremiumList] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    foc_storeId: "",
    foc_premiumId: "",
    foc_received: "",
    foc_used: "",
    foc_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchFOC = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) {
        toast.error("ไม่พบผู้ใช้", { description: "กรุณาเข้าสู่ระบบใหม่" });
        return;
      }

      try {
        const res = await fetch(`/api/foc/get`);
        const json = await res.json();
        if (json.success) {
          const allowedStores = user.user_storeId || [];
          const isAdmin = user.user_role === "admin";
          const filteredRecords = isAdmin
            ? json.data
            : json.data.filter((r) => allowedStores.includes(r.foc_storeId));
          setRecords(filteredRecords);
        } else {
          toast.error("เกิดข้อผิดพลาด", { description: json.message || "ไม่สามารถโหลดข้อมูลได้" });
        }
      } catch (err) {
        toast.error("เกิดข้อผิดพลาด", { description: err.message });
      }
    };

    fetchFOC();
  }, []);

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
        : allStores.filter((store) => allowedStores.includes(store.st_id_Code.toString()));
      setStoreList(filteredStores);
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchPremiums = async () => {
      const res = await fetch("/api/premium/get/get-sampling");
      const data = await res.json();
      setPremiumList(data.premiums || []);
    };
    fetchPremiums();
  }, []);

  const getCumulativeRemaining = (storeId, premiumId) => {
    return records
      .filter((r) => {
        const isSame = r.foc_storeId === storeId && r.foc_premiumId === premiumId;
        const isNotEditing = !editId || r._id !== editId;
        return isSame && isNotEditing;
      })
      .reduce((acc, cur) => acc + (parseFloat(cur.foc_received) - parseFloat(cur.foc_used)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.user_id) {
      toast.error("ไม่พบผู้ใช้", { description: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
      return;
    }

    // ✅ ตรวจสอบว่ากรอกข้อมูลครบ
    const requiredFields = [
      { key: "foc_storeId", label: "ร้านค้า" },
      { key: "foc_premiumId", label: "สินค้า FOC" },
      { key: "foc_received", label: "จำนวนที่รับ" },
      { key: "foc_used", label: "จำนวนที่ใช้" },
      { key: "foc_date", label: "วันที่" },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key] || formData[field.key].toString().trim() === "") {
        toast.error("กรุณากรอกข้อมูลให้ครบ", {
          description: `กรุณาเลือกหรือกรอก: ${field.label}`,
        });
        return;
      }
    }

    // ✅ ตรวจสอบค่าตัวเลขและไม่ติดลบ
    const foc_received = parseFloat(formData.foc_received);
    const foc_used = parseFloat(formData.foc_used);

    if (isNaN(foc_received) || isNaN(foc_used)) {
      toast.error("จำนวนต้องเป็นตัวเลขเท่านั้น");
      return;
    }

    if (foc_received < 0 || foc_used < 0) {
      toast.error("ห้ามกรอกจำนวนติดลบ", {
        description: "กรอกจำนวนรับและใช้เป็นศูนย์หรือมากกว่าเท่านั้น",
      });
      return;
    }

    const currentRemaining = getCumulativeRemaining(selectedStoreId, formData.foc_premiumId);

    // ✅ ป้องกันการกรอกใช้เกินยอดที่มี
    if (foc_used > currentRemaining + foc_received) {
      toast.error("ใช้เกินยอดที่มีอยู่", {
        description: `คุณใช้ไป ${foc_used} ชิ้น แต่ยอดคงเหลือมีอยู่เพียง ${(currentRemaining + foc_received).toLocaleString()} ชิ้น`,
      });
      return;
    }

    const foc_remaining = currentRemaining + foc_received - foc_used;

    const newRecord = {
      ...formData,
      foc_storeId: selectedStoreId,
      foc_received,
      foc_used,
      foc_remaining,
      user_id: user.user_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
      setIsSubmitting(true);

      try {
        const url = editId ? "/api/foc/edit" : "/api/foc/add";
        const method = editId ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editId ? { ...newRecord, _id: editId } : newRecord),
        });

        const data = await res.json();

        if (data.success) {
          if (editId) {
            setRecords(records.map((r) => (r._id === editId ? data.data : r)));
            setEditId(null);
            toast.success("แก้ไขสำเร็จ");
          } else {
            setRecords([...records, data.data]);
            toast.success("บันทึกสำเร็จ");
          }
          setFormData({ foc_storeId: "", foc_premiumId: "", foc_received: "", foc_used: "", foc_date: new Date().toISOString().split("T")[0] });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleDelete = async (id) => {
      if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;
      try {
        const res = await fetch(`/api/foc/delete?id=${id}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          setRecords(records.filter((r) => r._id !== id));
          toast.success("ลบข้อมูลสำเร็จ");
        } else {
          throw new Error(json.message);
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      }
    };

  const getStoreName = (storeId) => {
    const store = storeList.find((s) => s.st_id_Code === storeId);
    return store ? store.st_store_Name : storeId;
  };

  const getPremiumName = (premiumId) => {
  const p = premiumList.find(p => p.pm_id_premium === premiumId);
  return p ? p.pm_name_premium : "";
};

  const filteredRecords = selectedStoreId
  ? records.filter((r) => {
      const isSameStore = r.foc_storeId === selectedStoreId;
      const isSamePremium = formData.foc_premiumId
        ? r.foc_premiumId === formData.foc_premiumId
        : true; // ถ้ายังไม่เลือก premium ให้แสดงทั้งหมดของร้าน
      return isSameStore && isSamePremium;
    })
  : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
            <BackButton to="/form" />
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">การใช้ FOC ของชิม</h1>
              <p className="text-gray-600">จัดการการรับและใช้ของชิม FOC</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" /> {editId ? "แก้ไขการใช้ FOC" : "บันทึกการใช้ FOC"}
              </CardTitle>
              <CardDescription>กรอกข้อมูลการรับและใช้ของชิม FOC ในแต่ละวัน</CardDescription>
            </CardHeader>
            <CardContent>
              {editId && (
                <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-sm mb-4">
                  กำลังแก้ไขข้อมูล ID: {editId}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>เลือกร้าน</Label>
                  <Select
                    value={selectedStoreId}
                    onValueChange={(value) => {
                      setSelectedStoreId(value);
                      setFormData({ ...formData, foc_storeId: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกร้านค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {storeList.map((s) => (
                        <SelectItem key={s.st_id_Code} value={s.st_id_Code}>
                          {s.st_id_Code} - {s.st_store_Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>สินค้า FOC</Label>
                  <Select value={formData.foc_premiumId} onValueChange={(v) => setFormData({ ...formData, foc_premiumId: v })}>
                    <SelectTrigger><SelectValue placeholder="เลือกสินค้า FOC" /></SelectTrigger>
                    <SelectContent>
                      {premiumList.map((p) => (
                        <SelectItem key={p.pm_id_premium} value={p.pm_id_premium}>
                          {p.pm_id_premium} - {p.pm_name_premium}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStoreId && formData.foc_premiumId && (
                    <div className="text-sm text-blue-600 mt-1">
                      คงเหลือปัจจุบัน: <span className="font-bold">{getCumulativeRemaining(selectedStoreId, formData.foc_premiumId).toLocaleString()}</span> ชิ้น
                    </div>
                  )}
                </div>

                <div>
                  <Label>จำนวนที่รับ</Label>
                  <Input type="number" value={formData.foc_received} onChange={(e) => setFormData({ ...formData, foc_received: e.target.value })} required />
                </div>

                <div>
                  <Label>จำนวนที่ใช้</Label>
                  <Input type="number" value={formData.foc_used} onChange={(e) => setFormData({ ...formData, foc_used: e.target.value })} required />
                </div>

                <div>
                  <Label>วันที่ใช้</Label>
                  <Input type="date" value={formData.foc_date} onChange={(e) => setFormData({ ...formData, foc_date: e.target.value })} required />
                </div>
                
                <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-blue-600 hover:bg-blue-700 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
                 {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // รีเซ็ตค่าและออกจากโหมดแก้ไข
                      setEditId(null);
                      setFormData({
                        foc_storeId: "",
                        foc_premiumId: "",
                        foc_received: "",
                        foc_used: "",
                        foc_date: new Date().toISOString().split("T")[0],
                      });
                      setSelectedStoreId("");
                    }}
                  >
                    ยกเลิก
                  </Button>
                )}
              </div>  
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>ประวัติการใช้ FOC</CardTitle>
              <CardDescription>รายการที่บันทึกไว้ของร้านที่เลือก</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredRecords.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูล</p>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <div key={r._id || idx} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                      <div className="mb-2">
                        <p className="font-semibold">
                          ร้าน: {r.foc_storeId} - {getStoreName(r.foc_storeId)}
                        </p>
                        <p className="text-sm text-gray-600">
                          สินค้า: {r.foc_premiumId} - {getPremiumName(r.foc_premiumId)}
                        </p>
                      </div>
                        <p className="text-sm text-gray-500">{r.foc_date}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">รับมา</p>
                          <p className="font-semibold text-green-600">{r.foc_received}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">ใช้ไป</p>
                          <p className="font-semibold text-red-600">{r.foc_used}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">คงเหลือ</p>
                          <p className="font-semibold text-blue-600">{r.foc_remaining}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => {
                            setEditId(r._id);
                            setFormData({
                              foc_storeId: r.foc_storeId,
                              foc_premiumId: r.foc_premiumId,
                              foc_received: r.foc_received,
                              foc_used: r.foc_used,
                              foc_date: r.foc_date.split("T")[0],
                            });
                            setSelectedStoreId(r.foc_storeId);
                          }}
                        >
                          แก้ไข
                        </Button>
                        <Button
                          variant="destructive"
                          className="w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete(r._id)}
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

export default FOCUsage;
