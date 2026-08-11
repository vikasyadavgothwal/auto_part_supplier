"use client"

import { useState } from "react"
import { Eye, EyeOff, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authenticatedFetch } from "@/lib/auth/client"
import { appPath } from "@/lib/routes"

type Feedback = { title: string; message: string }

export function ChangePasswordCard() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [visible, setVisible] = useState({ currentPassword: false, newPassword: false, confirmPassword: false })
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const submit = async () => {
    if (!form.currentPassword) return setFeedback({ title: "Validation Error", message: "Current password is required" })
    if (form.newPassword.length < 8 || form.newPassword.length > 128) {
      return setFeedback({ title: "Validation Error", message: "New password must be between 8 and 128 characters" })
    }
    if (form.newPassword !== form.confirmPassword) {
      return setFeedback({ title: "Validation Error", message: "New passwords do not match" })
    }
    setIsSaving(true)
    try {
      const response = await authenticatedFetch(appPath("/api/auth/change-password"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const payload = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok || !payload.ok) throw new Error(payload.message || "Unable to change password")
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setFeedback({ title: "Password Changed", message: payload.message || "Password changed successfully" })
    } catch (error) {
      setFeedback({ title: "Unable To Change Password", message: error instanceof Error ? error.message : "Unable to change password" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="rounded-sm border border-border bg-brand-panel shadow-none">
      <Dialog open={Boolean(feedback)} onOpenChange={(open) => !open && setFeedback(null)}>
        <DialogContent className="border-border bg-brand-panel text-foreground">
          <DialogHeader><DialogTitle>{feedback?.title}</DialogTitle><DialogDescription>{feedback?.message}</DialogDescription></DialogHeader>
          <DialogFooter><Button type="button" onClick={() => setFeedback(null)}>OK</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        {(["currentPassword", "newPassword", "confirmPassword"] as const).map((key) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`password-${key}`}>{key === "currentPassword" ? "Current Password" : key === "newPassword" ? "New Password" : "Confirm Password"}</Label>
            <div className="relative">
              <Input
                id={`password-${key}`}
                type={visible[key] ? "text" : "password"}
                autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                maxLength={128}
                placeholder={key === "currentPassword" ? "Enter current password" : key === "newPassword" ? "Enter new password" : "Confirm new password"}
                className="border-border bg-brand-surface pr-11"
              />
              <button
                type="button"
                aria-label={`${visible[key] ? "Hide" : "Show"} ${key === "currentPassword" ? "current password" : key === "newPassword" ? "new password" : "confirm password"}`}
                onClick={() => setVisible((current) => ({ ...current, [key]: !current[key] }))}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {visible[key] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        ))}
        <div className="md:col-span-3"><Button type="button" disabled={isSaving} onClick={submit} className="gap-2 bg-primary text-primary-foreground hover:bg-brand-primary-hover"><KeyRound className="size-4" />{isSaving ? "Changing..." : "Change Password"}</Button></div>
      </CardContent>
    </Card>
  )
}
