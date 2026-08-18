"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type ToastType = "success" | "error"

type ToastInput = {
  type: ToastType
  title: string
  message?: string
}

type ToastRecord = ToastInput & {
  id: number
}

type ToastContextValue = {
  showToast: (toast: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts((current) => {
        const duplicate = current.some(
          (item) =>
            item.type === toast.type &&
            item.title === toast.title &&
            item.message === toast.message,
        )
        return duplicate ? current : [...current.slice(-2), { ...toast, id }]
      })
      window.setTimeout(() => dismissToast(id), 4500)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => {
          const Icon = toast.type === "success" ? CheckCircle2 : AlertCircle
          return (
            <div
              key={toast.id}
              role="status"
              className={
                toast.type === "success"
                  ? "pointer-events-auto rounded-sm border border-green-500/25 bg-brand-panel p-4 text-foreground shadow-2xl"
                  : "pointer-events-auto rounded-sm border border-destructive/25 bg-brand-panel p-4 text-foreground shadow-2xl"
              }
            >
              <div className="flex gap-3">
                <Icon
                  className={
                    toast.type === "success"
                      ? "mt-0.5 size-5 shrink-0 text-green-400"
                      : "mt-0.5 size-5 shrink-0 text-destructive"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold leading-5">
                    {toast.title}
                  </p>
                  {toast.message ? (
                    <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                      {toast.message}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Dismiss notification"
                  onClick={() => dismissToast(toast.id)}
                  className="-mr-2 -mt-2 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }
  return context
}
