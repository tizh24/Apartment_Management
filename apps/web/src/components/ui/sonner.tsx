"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon className="h-5 w-5 text-emerald-600 shrink-0" weight="fill" />
        ),
        info: (
          <InfoIcon className="h-5 w-5 text-[#ff385c] shrink-0" weight="fill" />
        ),
        warning: (
          <WarningIcon className="h-5 w-5 text-amber-600 shrink-0" weight="fill" />
        ),
        error: (
          <XCircleIcon className="h-5 w-5 text-rose-600 shrink-0" weight="fill" />
        ),
        loading: (
          <SpinnerIcon className="h-5 w-5 text-[#ff385c] shrink-0 animate-spin" weight="bold" />
        ),
      }}
      style={
        {
          "--border-radius": "16px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-[#3f2d28] group-[.toaster]:border-[#fcd5ce] group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:font-sans group-[.toaster]:border group-[.toaster]:flex group-[.toaster]:items-start group-[.toaster]:gap-3 group-[.toaster]:transition-all group-[.toaster]:duration-300",
          title: "group-[.toast]:text-xs group-[.toast]:font-extrabold group-[.toast]:text-[#3f2d28] group-[.toast]:leading-normal",
          description: "group-[.toast]:text-[11px] group-[.toast]:text-[#8f6f64] group-[.toast]:font-semibold group-[.toast]:leading-relaxed group-[.toast]:mt-0.5",
          actionButton: "group-[.toast]:bg-[#ff385c] group-[.toast]:text-white group-[.toast]:font-extrabold group-[.toast]:text-[11px] group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 hover:group-[.toast]:bg-[#e00b41] active:group-[.toast]:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
          cancelButton: "group-[.toast]:bg-[#fff8f6] group-[.toast]:text-[#3f2d28] group-[.toast]:border group-[.toast]:border-[#fcd5ce] group-[.toast]:font-bold group-[.toast]:text-[11px] group-[.toast]:rounded-xl group-[.toast]:px-3 group-[.toast]:py-1.5 hover:group-[.toast]:bg-[#fcd5ce]/30 active:group-[.toast]:scale-95 transition-all duration-200 cursor-pointer",
          closeButton: "group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-[#fcd5ce] group-[.toast]:text-[#8f6f64] hover:group-[.toast]:text-[#ff385c] hover:group-[.toast]:border-[#ffb5a7] transition-all duration-200 shadow-sm",
          success: "group-[.toaster]:!border-emerald-250 group-[.toaster]:!bg-emerald-50/95 group-[.toaster]:!text-emerald-950",
          error: "group-[.toaster]:!border-rose-250 group-[.toaster]:!bg-rose-50/95 group-[.toaster]:!text-rose-950",
          warning: "group-[.toaster]:!border-amber-250 group-[.toaster]:!bg-amber-50/95 group-[.toaster]:!text-amber-950",
          info: "group-[.toaster]:!border-[#fcd5ce]/80 group-[.toaster]:!bg-[#fff8f6]/95 group-[.toaster]:!text-[#ff385c]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

