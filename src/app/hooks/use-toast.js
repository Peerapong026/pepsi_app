"use client";
import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

export function useToast() {
  const toast = useCallback((options) => {
    sonnerToast(options);
  }, []);

  return {
    toast,
  };
}
