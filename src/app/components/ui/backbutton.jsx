"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button"; // ใช้จาก shadcn/ui

export default function BackButton({ to = "/form", label = "กลับ", className = "" }) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push(to)}
      className={`flex items-center gap-2 text-gray-700 border-gray-300 hover:border-gray-500 hover:text-gray-600 transition rounded-md px-4 py-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
}
