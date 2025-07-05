"use client";

import { useState } from "react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ArrowLeft, Plus, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Stores = () => {
  const router = useRouter();
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    st_id_Code: "",
    st_Agency: "",
    st_Region: "",
    st_DT_Name: "",
    st_DT_Code: "",
    st_store_Name: "",
  });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores/get");
        if (!res.ok) throw new Error("โหลดข้อมูลร้านค้าไม่สำเร็จ");
        const data = await res.json();
        setStores(data);
      } catch (error) {
        console.error("fetch error:", error);
        ({
          title: "เกิดข้อผิดพลาด",
          description: "โหลดร้านค้าไม่สำเร็จ",
        });
      }
    };
    fetchStores();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  const newStore = {
    ...formData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const res = await fetch("/api/stores/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStore)
    });

    if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");

    const saved = await res.json();
    setStores((prev) => [...prev, saved]);
    setFormData({
      st_id_Code: "",
      st_store_Name: "",
      st_Agency: "",
      st_Region: "",
      st_DT_Name: "",
      st_DT_Code: ""
    });

    toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลร้านค้าถูกบันทึกแล้ว" });
  } catch (err) {
    toast({ title: "เกิดข้อผิดพลาด", description: err.message });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
            <BackButton to="/form" />
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการร้านค้า</h1>
              <p className="text-gray-600">ข้อมูลร้านค้าและเอเจนซี่</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มร้านค้าใหม่
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลร้านค้าและเอเจนซี่
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="st_id_Code">รหัสร้านค้า (PK)</Label>
                  <Input
                    id="st_id_Code"
                    value={formData.st_id_Code}
                    onChange={(e) => setFormData({...formData, st_id_Code: e.target.value})}
                    placeholder="กรอกรหัสร้านค้า เช่น ST001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="st_store_Name">ชื่อร้านค้า</Label>
                  <Input
                    id="st_store_Name"
                    value={formData.st_store_Name}
                    onChange={(e) => setFormData({...formData, st_store_Name: e.target.value})}
                    placeholder="กรอกชื่อร้านค้า"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="st_Agency">เอเจนซี่</Label>
                  <Input
                    id="st_Agency"
                    value={formData.st_Agency}
                    onChange={(e) => setFormData({...formData, st_Agency: e.target.value})}
                    placeholder="กรอกชื่อเอเจนซี่"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="st_Region">ภูมิภาค</Label>
                  <Input
                    id="st_Region"
                    value={formData.st_Region}
                    onChange={(e) => setFormData({...formData, st_Region: e.target.value})}
                    placeholder="กรอกภูมิภาค เช่น กรุงเทพ"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="st_DT_Name">ชื่อ DT</Label>
                  <Input
                    id="st_DT_Name"
                    value={formData.st_DT_Name}
                    onChange={(e) => setFormData({...formData, st_DT_Name: e.target.value})}
                    placeholder="กรอกชื่อ DT"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="st_DT_Code">รหัส DT</Label>
                  <Input
                    id="st_DT_Code"
                    value={formData.st_DT_Code}
                    onChange={(e) => setFormData({...formData, st_DT_Code: e.target.value})}
                    placeholder="กรอกรหัส DT"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  บันทึกข้อมูล
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>รายการร้านค้า</CardTitle>
              <CardDescription>
                ร้านค้าที่บันทึกไว้ในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stores.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลร้านค้า</p>
                ) : (
                  stores.map((store) => (
                    <div key={store.st_id_Code} className="border rounded-lg p-4 bg-gray-50">
                    <p className="font-semibold text-indigo-700">{store.st_store_Name}</p>
                    <p className="text-sm text-gray-600 mb-2">รหัสร้าน: {store.st_id_Code}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      <div>
                        <p className="text-gray-600">เอเจนซี่:</p>
                        <p className="font-semibold">{store.st_Agency}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ภูมิภาค:</p>
                        <p className="font-semibold">{store.st_Region}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">DT:</p>
                        <p className="font-semibold">{store.st_DT_Name || "-"} ({store.st_DT_Code || "-"})</p>
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

export default Stores;
