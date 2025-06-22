// /components/ui/alert-dialog.jsx
"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

// ครอบ Dialog ให้กลายเป็น AlertDialog
export const AlertDialog = Dialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogContent = DialogContent;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;

// ถ้าอยากมี Cancel / Action เพิ่มเติม
export const AlertDialogCancel = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
    {...props}
  >
    {children || "ยกเลิก"}
  </button>
);

export const AlertDialogAction = ({ children, ...props }) => (
  <button
    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm"
    {...props}
  >
    {children || "ตกลง"}
  </button>
);