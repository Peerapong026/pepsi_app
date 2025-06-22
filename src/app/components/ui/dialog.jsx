"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils"; // ถ้ายังไม่มีไฟล์นี้ ให้เปลี่ยนเป็น className ตรงๆ ได้

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export const DialogPortal = ({ className, children, ...props }) => (
  <RadixDialog.Portal {...props}>
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      {children}
    </div>
  </RadixDialog.Portal>
);

export const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-40",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        "fixed z-50 w-full max-w-lg bg-white rounded-xl shadow-lg p-6",
        className
      )}
      {...props}
    >
      {children}
      <RadixDialog.Close className="absolute top-3 right-3 text-gray-500 hover:text-black">
        <X className="h-5 w-5" />
      </RadixDialog.Close>
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("mb-4", className)} {...props} />
);
export const DialogFooter = ({ className, ...props }) => (
  <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
);
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
