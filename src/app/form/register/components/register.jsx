"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ ใช้ใน Next.js
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import BackButton from "../../../components/ui/backbutton";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { useToast } from "../../../hooks/use-toast"; // ✅ ใช้ path ตรง



export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [storeList, setStoreList] = useState([]);
  const [formData, setFormData] = useState({
    user_id: "",
    user_password: "",
    user_firstname: "",
    user_lastname: "",
    user_phone: "",
    user_email: "",
    user_storeId: [],
    user_role: "member",
  });

  useEffect(() => {
    const fetchStores = async () => {
      const res = await fetch("/api/stores/get/get-id-name-store");
      const data = await res.json();
      setStoreList(data.stores || []);
    };
    fetchStores();
  }, []);

  const handleCheckboxChange = (storeId, checked) => {
    const newList = checked
      ? [...formData.user_storeId, storeId]
      : formData.user_storeId.filter((id) => id !== storeId);
    setFormData({ ...formData, user_storeId: newList });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔍 เช็ครหัสผู้ใช้ซ้ำก่อน
    const checkRes = await fetch(`/api/auth/get?user_id=${formData.user_id}`);
    const checkData = await checkRes.json();

    if (checkData.exists) {
      toast("รหัสผู้ใช้นี้ถูกใช้แล้ว", {
        description: "กรุณาเลือกรหัสใหม่",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast("ลงทะเบียนสำเร็จ");
        router.push("/login");
      } else {
        toast("เกิดข้อผิดพลาด", {
          description: data.message || "ไม่สามารถลงทะเบียนได้",
        });
      }
    } catch (err) {
      toast("เกิดข้อผิดพลาด", {
        description: err.message,
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 px-4">
  <div className="absolute top-6 left-6">
    <BackButton to="/form" />
  </div>
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>จัดการผู้ใช้ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>รหัสผู้ใช้</Label>
                <Input value={formData.user_id} onChange={(e) => setFormData({ ...formData, user_id: e.target.value })} required />
              </div>
              <div>
                <Label>รหัสผ่าน</Label>
                <Input type="password" value={formData.user_password} onChange={(e) => setFormData({ ...formData, user_password: e.target.value })} required />
              </div>
              <div>
                <Label>ชื่อ</Label>
                <Input value={formData.user_firstname} onChange={(e) => setFormData({ ...formData, user_firstname: e.target.value })} required />
              </div>
              <div>
                <Label>นามสกุล</Label>
                <Input value={formData.user_lastname} onChange={(e) => setFormData({ ...formData, user_lastname: e.target.value })} required />
              </div>
              <div>
                <Label>โทรศัพท์</Label>
                <Input value={formData.user_phone} onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })} required />
              </div>
              <div>
                <Label>อีเมล</Label>
                <Input type="email" value={formData.user_email} onChange={(e) => setFormData({ ...formData, user_email: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-white">
              {storeList.map((store) => (
                <div
                  key={store.st_id_Code}
                  className="flex items-start space-x-2 p-2 border rounded-md h-full min-h-[60px]" // 👈 เพิ่ม min-h
                >
                  <input
                    type="checkbox"
                    id={store.st_id_Code}
                    className="mt-1 h-4 w-4 accent-blue-600"
                    checked={formData.user_storeId.includes(store.st_id_Code)}
                    onChange={(e) => handleCheckboxChange(store.st_id_Code, e.target.checked)}
                  />
                  <label htmlFor={store.st_id_Code} className="text-sm text-gray-700 leading-snug">
                    <span className="block font-mono font-semibold">{store.st_id_Code}</span>
                    <span className="block">{store.st_store_Name}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="text-right">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-lg rounded-md shadow-md transition">
                บันทึกข้อมูล
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
