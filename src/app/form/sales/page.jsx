"use client";
import SaleForm from "./components/sale";
import SaleHistory from "./components/sale-history";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";

export default function SalesPage() {
  return (
    <div className="p-4">
      <Tabs defaultValue="form">
        <TabsList className="mb-4">
          <TabsTrigger value="form">กรอกยอดขาย</TabsTrigger>
          <TabsTrigger value="history">ประวัติการกรอก</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <SaleForm />
        </TabsContent>
        <TabsContent value="history">
          <SaleHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
