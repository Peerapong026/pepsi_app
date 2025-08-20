"use client";

// ถ้าคอมโพเนนต์ SaleEdit อยู่ที่ src/app/form/sales/components/sale-edit.jsx
import SaleEdit from "../../../form/sales/components/sale-edit";
import { useRouter } from "next/navigation";

export default function SalesEditPage({ params }) {
  const router = useRouter();
  const { id } = params;

  return (
    <div className="p-4">
      <SaleEdit
        saleId={id}
        onCancel={() => router.back()}
        onSaved={() => router.push("/form/sales")} // หรือ path ที่อยากกลับไป
      />
    </div>
  );
}
