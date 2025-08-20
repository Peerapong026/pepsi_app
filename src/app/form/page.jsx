"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Gift, TrendingUp, ShoppingCart, Building2, ChartNoAxesCombined, Boxes, FileSymlink, UserCog, CheckCircle } from "lucide-react";
import Navbar from "../components/ui/navbar";

const allMenuItems = [
  {
    title: "การใช้ FOC ของชิม",
    description: "จัดการการรับและใช้ของชิม FOC",
    icon: <Package className="w-8 h-8 text-white" />,
    color: "bg-blue-600",
    href: "/form/foc",
    roles: ["admin", "member"]
  },
  {
    title: "การใช้ Premium",
    description: "จัดการและติดตามการใช้สินค้า Premium",
    icon: <Gift className="w-8 h-8 text-white" />,
    color: "bg-indigo-600",
    href: "/form/premium",
    roles: ["admin", "member"]
  },
  {
    title: "Performance Tracking",
    description: "บันทึกผลการชิมสินค้า (ซื้อ/ไม่ซื้อ)",
    icon: <TrendingUp className="w-8 h-8 text-white" />,
    color: "bg-green-600",
    href: "/form/performance",
    roles: ["admin", "member"]
  },
  {
    title: "ยอดขายสินค้า",
    description: "จัดการข้อมูลยอดขายและราคาสินค้า",
    icon: <ShoppingCart className="w-8 h-8 text-white" />,
    color: "bg-orange-600",
    href: "/form/sales",
    roles: ["admin", "member"]
  },
  {
    title: "จัดการร้านค้า",
    description: "ข้อมูลร้านค้าและพื้นที่ที่วางขาย",
    icon: <Building2 className="w-8 h-8 text-white" />,
    color: "bg-red-600",
    href: "/form/stores",
    roles: ["admin"] // 👈 เฉพาะ admin เท่านั้น
  },
  {
    title: "จัดการสินค้า",
    description: "ข้อมูลสินค้า SKU",
    icon: <Boxes className="w-8 h-8 text-white" />,
    color: "bg-orange-400",
    href: "/form/products",
    roles: ["admin"] // 👈 เฉพาะ admin เท่านั้น
  },
  {
    title: "สรุปงาน",
    description: "ผลสรุปทั้งหมด",
    icon: <ChartNoAxesCombined className="w-8 h-8 text-white" />,
    color: "bg-rose-400",
    href: "/form/summary",
    roles: ["admin"] // 👈 เฉพาะ admin เท่านั้น
  },
  {
    title: "จัดการผู้ใช้",
    description: "นำเข้าข้อมูลผู้ใช้",
    icon: <UserCog className="w-8 h-8 text-white" />,
    color: "bg-yellow-400",
    href: "/form/register",
    roles: ["admin"] // 👈 เฉพาะ admin เท่านั้น
  },
  {
    title: "รายงาน",
    description: "Report",
    icon: <FileSymlink className="w-8 h-8 text-white" />,
    color: "bg-yellow-300",
    href: "/form/export",
    roles: ["admin"] // 👈 เฉพาะ admin เท่านั้น
  },
//   {
//   title: "ตรวจสอบการส่งงาน",
//   description: "ตรวจสอบการส่งข้อมูล",
//   icon: <CheckCircle className="w-8 h-8 text-white" />,
//   color: "bg-teal-600",
//   href: "/form/edit",
//   roles: ["member","admin"]
// }
];


export default function FormMenu() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setRole(parsed.user_role?.toLowerCase() || "");
    }
  }, []);

  const menuItems = allMenuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      <Navbar />
        <div className="pt-18 min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              ระบบเก็บข้อมูล
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              จัดการข้อมูลการใช้ FOC, Premium, Performance และยอดขาย
            </p>
          </div>

          <div className="w-full max-w-6xl px-4 flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm hover:shadow-xl transition duration-300 flex flex-col items-center text-center"
                >
                  <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 ${item.color}`}>
                    {item.icon}
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{item.title}</h2>
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  <Link href={item.href} className="mt-auto">
                    <div
                      className={`inline-block px-4 py-2 rounded-md text-white text-sm font-medium ${item.color} hover:opacity-90`}
                    >
                      เข้าทำงาน
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
  );
}
