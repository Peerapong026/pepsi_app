"use client";
import { useState } from "react";
import SaleForm from "./components/sale";
import SaleHistory from "./components/sale-history";
import SaleEdit from "./components/sale-edit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";

export default function SalesPage() {
  const [tab, setTab] = useState("form");       // ไม่มี <...>
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-4">
      {/* shadcn Tabs รองรับ value/onValueChange */}
      <Tabs value={tab} onValueChange={(v) => setTab(v)}>
        <TabsList className="mb-4">
          <TabsTrigger value="form">กรอกยอดขาย</TabsTrigger>
          <TabsTrigger value="history">ประวัติการกรอก</TabsTrigger>
          <TabsTrigger value="edit" disabled={!editingId}>แก้ไข</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <SaleForm />
        </TabsContent>

        <TabsContent value="history">
          <SaleHistory
            key={refreshKey}
            onEdit={(sale) => {
              const id = sale._id || sale.sal_id;
              if (!id) return;
              setEditingId(id);
              setTab("edit");
            }}
          />
        </TabsContent>

        <TabsContent value="edit">
          {editingId ? (
            <SaleEdit
              saleId={editingId}
              onCancel={() => setTab("history")}
              onSaved={() => {
                setTab("history");
                setRefreshKey((k) => k + 1);
              }}
            />
          ) : (
            <div className="text-gray-500">
              เลือกบิลจากแท็บ “ประวัติการกรอก” เพื่อแก้ไข
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
