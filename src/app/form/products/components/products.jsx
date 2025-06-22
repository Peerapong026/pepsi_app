"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ArrowLeft, Plus, Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../hooks/use-toast";

export default function ProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [skuList, setSkuList] = useState([]);
  const [sampleList, setSampleList] = useState([]);
  const [giftList, setGiftList] = useState([]);

  const [skuForm, setSkuForm] = useState({
    sku_id: "",
    sku_name: "",
    sku_category: "",
    sku_volume: "",
    sku_packsize: "",
    sku_numberlot: "",
    sku_expiration_date: "",
  });

  const [sampleForm, setSampleForm] = useState({
    pm_id_premium: "",
    pm_type_premium: "ของชิม",
    pm_name_premium: "",
    pm_category: "",
    pm_volume: "",
    pm_packsize: "",
    pm_numberlot: "",
    pm_expire: "",
  });

  const [giftForm, setGiftForm] = useState({
    pm_id_premium: "",
    pm_type_premium: "ของแถม",
    pm_name_premium: "",
    pm_category: "",
    pm_volume: "",
    pm_packsize: "",
    pm_numberlot: "",
    pm_expire: "",
  });

  const handleSubmitSku = async (e) => {
  e.preventDefault();
  const newItem = {
    ...skuForm,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // ตรวจสอบว่า sku_id และ sku_name ต้องมี
  if (!newItem.sku_id || !newItem.sku_name) {
    toast({ title: "กรุณากรอกข้อมูล SKU ให้ครบถ้วน" });
    return;
  }

  try {
    const res = await fetch("/api/products/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

    setSkuList((prev) => [...prev, newItem]);
    setSkuForm({
      sku_id: "",
      sku_name: "",
      sku_category: "",
      sku_volume: "",
      sku_packsize: "",
      sku_numberlot: "",
      sku_expiration_date: "",
    });

    toast({ title: "บันทึกสำเร็จ", description: "ข้อมูล SKU ถูกบันทึกแล้ว" });
  } catch (err) {
    toast({ title: "เกิดข้อผิดพลาด", description: err.message });
  }
};

const handleSubmitSample = async (e) => {
  e.preventDefault();
  const newItem = {
    ...sampleForm,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!newItem.pm_id_premium || !newItem.pm_name_premium) {
    toast({ title: "กรุณากรอกข้อมูลของชิมให้ครบถ้วน" });
    return;
  }

  try {
    const res = await fetch("/api/premium/add-sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

    setSampleList((prev) => [...prev, newItem]);
    setSampleForm({
      pm_id_premium: "",
      pm_type_premium: "ของชิม",
      pm_name_premium: "",
      pm_category: "",
      pm_volume: "",
      pm_packsize: "",
      pm_numberlot: "",
      pm_expire: "",
    });

    toast({ title: "บันทึกสำเร็จ", description: "ของชิมถูกบันทึกแล้ว" });
  } catch (err) {
    toast({ title: "เกิดข้อผิดพลาด", description: err.message });
  }
};

const handleSubmitGift = async (e) => {
  e.preventDefault();
  const newItem = {
    ...giftForm,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!newItem.pm_id_premium || !newItem.pm_name_premium) {
    toast({ title: "กรุณากรอกข้อมูลของแถมให้ครบถ้วน" });
    return;
  }

  try {
    const res = await fetch("/api/premium/add-gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

    setGiftList((prev) => [...prev, newItem]);
    setGiftForm({
      pm_id_premium: "",
      pm_type_premium: "ของแถม",
      pm_name_premium: "",
      pm_category: "",
      pm_volume: "",
      pm_packsize: "",
      pm_numberlot: "",
      pm_expire: "",
    });

    toast({ title: "บันทึกสำเร็จ", description: "ของแถมถูกบันทึกแล้ว" });
  } catch (err) {
    toast({ title: "เกิดข้อผิดพลาด", description: err.message });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={() => router.push("/form")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> กลับ
          </Button>
          <div className="flex items-center">
            <Archive className="w-8 h-8 text-teal-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
              <p className="text-gray-600">ข้อมูล SKU, ของชิม และของแถม</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="sku">
          <TabsList>
            <TabsTrigger value="sku">SKU</TabsTrigger>
            <TabsTrigger value="sample">ของชิม</TabsTrigger>
            <TabsTrigger value="gift">ของแถม</TabsTrigger>
          </TabsList>

          {/* SKU */}
          <TabsContent value="sku">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>เพิ่ม SKU</CardTitle>
                <CardDescription>ฟอร์มกรอกข้อมูลสินค้า SKU</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSku}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>รหัส SKU</Label><Input value={skuForm.sku_id} onChange={e => setSkuForm({ ...skuForm, sku_id: e.target.value })} /></div>
                  <div><Label>ชื่อสินค้า</Label><Input value={skuForm.sku_name} onChange={e => setSkuForm({ ...skuForm, sku_name: e.target.value })} /></div>
                  <div><Label>แบรนด์</Label><Input value={skuForm.sku_category} onChange={e => setSkuForm({ ...skuForm, sku_category: e.target.value })} /></div>
                  <div><Label>ปริมาตร</Label><Input value={skuForm.sku_volume} onChange={e => setSkuForm({ ...skuForm, sku_volume: e.target.value })} /></div>
                  <div><Label>Packsize</Label><Input value={skuForm.sku_packsize} onChange={e => setSkuForm({ ...skuForm, sku_packsize: e.target.value })} /></div>
                  <div><Label>Lot</Label><Input value={skuForm.sku_numberlot} onChange={e => setSkuForm({ ...skuForm, sku_numberlot: e.target.value })} /></div>
                  <div><Label>วันหมดอายุ</Label><Input type="date" value={skuForm.sku_expiration_date} onChange={e => setSkuForm({ ...skuForm, sku_expiration_date: e.target.value })} /></div>
                  <Button type="submit" className="col-span-full bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-1" /> บันทึก SKU
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ของชิม */}
          <TabsContent value="sample">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>เพิ่มของชิม</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSample}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>รหัส</Label><Input value={sampleForm.pm_id_premium} onChange={e => setSampleForm({ ...sampleForm, pm_id_premium: e.target.value })} /></div>
                  <div><Label>ชื่อ</Label><Input value={sampleForm.pm_name_premium} onChange={e => setSampleForm({ ...sampleForm, pm_name_premium: e.target.value })} /></div>
                  <div><Label>ประเภท</Label><Input value={sampleForm.pm_type_premium} onChange={e => setSampleForm({ ...sampleForm, pm_type_premium: e.target.value })} /></div>
                  <div><Label>หมวดหมู่</Label><Input value={sampleForm.pm_category} onChange={e => setSampleForm({ ...sampleForm, pm_category: e.target.value })} /></div>
                  <div><Label>ปริมาตร</Label><Input value={sampleForm.pm_volume} onChange={e => setSampleForm({ ...sampleForm, pm_volume: e.target.value })} /></div>
                  <div><Label>Packsize</Label><Input value={sampleForm.pm_packsize} onChange={e => setSampleForm({ ...sampleForm, pm_packsize: e.target.value })} /></div>
                  <div><Label>Lot</Label><Input value={sampleForm.pm_numberlot} onChange={e => setSampleForm({ ...sampleForm, pm_numberlot: e.target.value })} /></div>
                  <div><Label>วันหมดอายุ</Label><Input type="date" value={sampleForm.pm_expire} onChange={e => setSampleForm({ ...sampleForm, pm_expire: e.target.value })} /></div>
                  <Button type="submit" className="col-span-full bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-1" /> บันทึกของชิม
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ของแถม */}
          <TabsContent value="gift">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>เพิ่มของแถม</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitGift}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>รหัส</Label><Input value={giftForm.pm_id_premium} onChange={e => setGiftForm({ ...giftForm, pm_id_premium: e.target.value })} /></div>
                  <div><Label>ชื่อ</Label><Input value={giftForm.pm_name_premium} onChange={e => setGiftForm({ ...giftForm, pm_name_premium: e.target.value })} /></div>
                  <div><Label>ประเภท</Label><Input value={giftForm.pm_type_premium} onChange={e => setGiftForm({ ...giftForm, pm_type_premium: e.target.value })} /></div>
                  <div><Label>หมวดหมู่</Label><Input value={giftForm.pm_category} onChange={e => setGiftForm({ ...giftForm, pm_category: e.target.value })} /></div>
                  <div><Label>ปริมาตร</Label><Input value={giftForm.pm_volume} onChange={e => setGiftForm({ ...giftForm, pm_volume: e.target.value })} /></div>
                  <div><Label>Packsize</Label><Input value={giftForm.pm_packsize} onChange={e => setGiftForm({ ...giftForm, pm_packsize: e.target.value })} /></div>
                  <div><Label>Lot</Label><Input value={giftForm.pm_numberlot} onChange={e => setGiftForm({ ...giftForm, pm_numberlot: e.target.value })} /></div>
                  <div><Label>วันหมดอายุ</Label><Input type="date" value={giftForm.pm_expire} onChange={e => setGiftForm({ ...giftForm, pm_expire: e.target.value })} /></div>
                  <Button type="submit" className="col-span-full bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-1" /> บันทึกของแถม
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
