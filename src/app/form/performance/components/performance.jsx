"use client";

import { useState,useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { ArrowLeft, Plus, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Performance = () => {
  const router = useRouter();
  const [userStoreId, setUserStoreId] = useState("");
  const [userStoreName, setUserStoreName] = useState("");
  const [storeList, setStoreList] = useState([]);
  const [performance_records, setPerformanceRecords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [performanceForm, setPerformanceForm] = useState({
    per_storeId: "",
    per_storeName: "",
    per_result: "",
    per_reason: "",
    per_quantity: "",
    per_date: new Date().toISOString().split('T')[0],
  });

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
    };
    fetchStores();
  }, []);

  const fetchPerformance = async (storeId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const parsed = JSON.parse(storedUser);
    const user_id = parsed.user_id;

    try {
      const res = await fetch(
        `/api/performance/get?storeId=${storeId}&user_id=${user_id}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setPerformanceRecords(data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด", { description: error.message });
    }
  };

  useEffect(() => {
    if (userStoreId) {
      fetchPerformance(userStoreId);
    }
  }, [userStoreId]);

  const boughtReasons = [
    "รสชาติดี",
    "ราคาเหมาะสม",
    "บรรจุภัณฑ์สวย",
    "แบรนด์มีชื่อเสียง",
    "โปรโมชั่นดี",
  ];

  const notBoughtReasons = [
    "รสชาติไม่ถูกใจ",
    "ราคาแพง",
    "บรรจุภัณฑ์ไม่สวย",
    "ไม่รู้จักแบรนด์",
    "ไม่มีความต้องการ",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ตรวจว่ากรอกข้อมูลครบถ้วน
  const requiredFields = [
    { key: "per_storeId", label: "ร้านค้า" },
    { key: "per_result", label: "ผลการชิม" },
    { key: "per_reason", label: "เหตุผล" },
    { key: "per_quantity", label: "จำนวน" },
    { key: "per_date", label: "วันที่" },
  ];

  for (const field of requiredFields) {
    const value = performanceForm[field.key];
    if (!value || value.toString().trim() === "") {
      toast.error("กรุณากรอกข้อมูลให้ครบ", {
        description: `กรุณาเลือกหรือกรอก: ${field.label}`,
      });
      setIsSubmitting(false);
      return;
    }
  }

  // ตรวจไม่ให้กรอกเลขติดลบ หรือ 0
  const quantity = parseInt(performanceForm.per_quantity || "0", 10);
  if (isNaN(quantity) || quantity <= 0) {
    toast.error("จำนวนต้องมากกว่า 0", {
      description: "กรุณากรอกจำนวนคนที่ชิมเป็นเลขจำนวนเต็มมากกว่า 0",
    });
    setIsSubmitting(false);
    return;
  }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("ไม่พบผู้ใช้", {
        description: "กรุณาเข้าสู่ระบบใหม่",
      });
       setIsSubmitting(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const user_id = parsedUser.user_id;

    const newRecord = {
      ...performanceForm,
      per_quantity: parseInt(performanceForm.per_quantity || "0", 10),
      user_id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/performance/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("บันทึกสำเร็จ", {
          description: "ข้อมูล Performance ถูกส่งไปยังฐานข้อมูลแล้ว",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        window.location.reload();
      } else {
        throw new Error(result.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", {
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonOptions = () => {
    if (performanceForm.per_result === "ซื้อ") return boughtReasons;
    if (performanceForm.per_result === "ไม่ซื้อ") return notBoughtReasons;
    return [];
  };

  const getBoughtCount = () =>
    performance_records
      .filter((r) => r.per_result === "ซื้อ")
      .reduce((sum, r) => sum + (r.per_quantity || 0), 0);

  const getNotBoughtCount = () =>
    performance_records
      .filter((r) => r.per_result === "ไม่ซื้อ")
      .reduce((sum, r) => sum + (r.per_quantity || 0), 0);

  const getTotalCount = () =>
    performance_records.reduce((sum, r) => sum + (r.per_quantity || 0), 0);

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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">{getBoughtCount()}</p>
              <p className="text-sm text-gray-600">ชิมแล้วซื้อ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-red-600">{getNotBoughtCount()}</p>
              <p className="text-sm text-gray-600">ชิมแล้วไม่ซื้อ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-purple-600">{getTotalCount()}</p>
              <p className="text-sm text-gray-600">รวมทั้งหมด</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                บันทึก Performance
              </CardTitle>
              <CardDescription>บันทึกผลการชิมและเหตุผลในการตัดสินใจ</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="per_storeId">ร้านค้า</Label>
                  <Select
                    value={performanceForm.per_storeId}
                    onValueChange={(value) => {
                      const store = storeList.find((s) => s.st_id_Code === value);
                      setUserStoreId(store?.st_id_Code || "");
                      setUserStoreName(store?.st_store_Name || "");
                      setPerformanceForm({
                        ...performanceForm,
                        per_storeId: store?.st_id_Code || "",
                        per_storeName: store?.st_store_Name || "",
                      });
                    }}
                  >
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
                    <Label htmlFor="per_date">วันที่</Label>
                    <input
                      type="date"
                      id="per_date"
                      value={performanceForm.per_date}
                      onChange={(e) =>
                        setPerformanceForm({ ...performanceForm, per_date: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    />
                  </div>
                  
                <div>
                  <Label>การชิม</Label>
                  <RadioGroup className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="ซื้อ"
                        checked={performanceForm.per_result === "ซื้อ"}
                        onChange={() =>
                          setPerformanceForm({ ...performanceForm, per_result: "ซื้อ", per_reason: "" })
                        }
                        name="per_result"
                      />
                      <Label htmlFor="bought" className="text-green-600 font-semibold">
                        ชิมแล้วซื้อ
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="ไม่ซื้อ"
                        checked={performanceForm.per_result === "ไม่ซื้อ"}
                        onChange={() =>
                          setPerformanceForm({ ...performanceForm, per_result: "ไม่ซื้อ", per_reason: "" })
                        }
                        name="per_result"
                      />
                      <Label htmlFor="not-bought" className="text-red-600 font-semibold">
                        ชิมแล้วไม่ซื้อ
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {performanceForm.per_result && (
                  <div>
                    <Label htmlFor="per_reason">เหตุผล</Label>
                    <Select value={performanceForm.per_reason} onValueChange={(value) => setPerformanceForm({ ...performanceForm, per_reason: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเหตุผล" />
                      </SelectTrigger>
                      <SelectContent>
                        {getReasonOptions().map((reason, index) => (
                          <SelectItem key={index} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {performanceForm.per_reason && (
                      <div>
                        <Label htmlFor="per_quantity">จำนวน</Label>
                        <input
                          type="number"
                          id="per_quantity"
                          min="1"
                          placeholder="ระบุจำนวนคนที่ชิม"
                          value={performanceForm.per_quantity}
                          onChange={(e) =>
                            setPerformanceForm({
                              ...performanceForm,
                              per_quantity: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                        />
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!performanceForm.per_storeId || !performanceForm.per_result || !performanceForm.per_reason || !performanceForm.per_quantity}
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Records Section */}
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
                    <div key={record.per_id || record._id || index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">ร้าน: {record.per_storeId} - {record.per_storeName}</p>
                          <p className={`text-sm font-semibold ${record.per_result === 'ซื้อ' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.per_result === 'ซื้อ' ? 'ชิมแล้วซื้อ' : 'ชิมแล้วไม่ซื้อ'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{record.per_date}</p>
                      </div>
                     <p className="text-sm text-gray-700 bg-white p-2 rounded">
                      <strong>เหตุผล:</strong> {record.per_reason} <br />
                      <strong>จำนวน:</strong> {record.per_quantity} คน
                    </p>
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
