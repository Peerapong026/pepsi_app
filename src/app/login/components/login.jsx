"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [user_id, setUserId] = useState("");
  const [user_password, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 🔹 เพิ่ม state loading
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return; // 🔒 กันการกดซ้ำ
    setIsLoading(true); // ⏳ เริ่มโหลด

    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ user_id, user_password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (data.success) {
      toast.success("เข้าสู่ระบบสำเร็จ ✨", {
        position: "top-center",
        autoClose: 1800,
      });

      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.user_role === "admin") router.push("/form");
        else if (data.user.user_role === "member") router.push("/form");
      }, 1800);
    } else {
      toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง ❌", {
        position: "top-center",
        autoClose: 2500,
      });
      setIsLoading(false); // ❌ login fail → ให้ลองใหม่ได้
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 px-4">
      <ToastContainer />
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md"
      >
        <div className=" flex items-center justify-center bg-[#ffffff] px-4 mb-2">
        <img
          src="https://www.pepsico.com/images/default-source/products-brands/pepsi-brand-logo---320x320.png?sfvrsn=60c7278e_3"
          alt="Pepsi Logo"
          className="w-20 h-20 object-contain items-center rounded-full shadow-md mt-1"
          draggable={false}
        /></div>
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">เข้าสู่ระบบ</h2>

        <div className="mb-4">
          <label className="block mb-1 font-semibold text-gray-700">รหัสผู้ใช้</label>
          <Input
            type="text"
            placeholder="Username"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-semibold text-gray-700">รหัสผ่าน</label>
          <Input
            type="password"
            placeholder="Password"
            value={user_password}
            onChange={(e) => setUserPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading} // 🔐 ปิดปุ่มตอนโหลด
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-lg rounded-md shadow-md transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>
    </div>
  );
}
