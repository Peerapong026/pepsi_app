"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const { user_firstname, user_lastname } = parsed;
      setFullName(`${user_firstname} ${user_lastname}`);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-14 bg-white shadow z-50">
      <div className="max-w-7xl mx-auto h-full px-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-blue-600">PEPSI</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 font-medium">👤 {fullName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-700 font-semibold flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
}
