"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme === "dark" ? "dark" : "light"}
      position="top-center"
      expand={false}
      closeButton
      duration={4000}
      gap={10}
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
        info: <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />,
        close: <X className="w-3.5 h-3.5" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !border-[#ECEEF2] dark:!border-white/10 !bg-white/95 dark:!bg-[#13161E]/95 !backdrop-blur-md !px-4 !py-3 !shadow-[0_12px_32px_rgba(0,0,0,0.08)] !text-[#171717] dark:!text-white !font-sans !text-[13px] !font-semibold !gap-2.5",
          title: "!text-[13px] !font-semibold !leading-snug",
          description: "!text-[12px] !font-medium !text-[#68707A] dark:!text-neutral-400",
          closeButton:
            "!bg-transparent !border-0 !text-[#8C929C] hover:!text-[#171717] dark:hover:!text-white !top-1/2 !-translate-y-1/2 !right-2.5 !left-auto !transform",
          success: "!border-emerald-200/80 dark:!border-emerald-500/25",
          error: "!border-rose-200/80 dark:!border-rose-500/25",
          warning: "!border-amber-200/80 dark:!border-amber-500/25",
          info: "!border-sky-200/80 dark:!border-sky-500/25",
        },
      }}
    />
  );
}
