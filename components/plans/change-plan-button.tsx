"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/toast-provider"

export function ChangePlanButton({
  businessAccountId,
  currentPlanName,
  planId,
  planName,
  actionLabel,
  isDowngrade,
}: {
  businessAccountId: string
  currentPlanName: string
  planId: string
  planName: string
  actionLabel: string
  isDowngrade: boolean
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const changePlan = async () => {
    setSaving(true)
    const response = await fetch("/api/plans/change", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        "Idempotency-Key": `supplier-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      },
      body: JSON.stringify({
        businessAccountId,
        planId,
        paymentSuccessUrl: `${window.location.origin}/plans?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        paymentCancelUrl: `${window.location.origin}/plans?payment=cancelled`,
      }),
    })
    const result = (await response.json().catch(() => null)) as {
      message?: string
      change?: { status?: string; effectiveAt?: string }
      payment?: { checkoutUrl?: string | null; stripeConfigured?: boolean }
    } | null
    setSaving(false)
    if (!response.ok) {
      showToast({ type: "error", title: "Unable to change plan", message: result?.message ?? "Unable to change plan." })
      return
    }
    setIsDialogOpen(false)
    if (result?.payment?.checkoutUrl) {
      window.location.assign(result.payment.checkoutUrl)
      return
    }
    if (result?.change?.status === "scheduled") {
      const date = result.change.effectiveAt
        ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(result.change.effectiveAt))
        : "the end of your current billing period"
      showToast({ type: "success", title: "Downgrade scheduled", message: `${planName} activates on ${date}.` })
    } else {
      showToast({ type: "success", title: "Plan upgraded", message: `${planName} is active now.` })
    }
    router.refresh()
  }

  return (
    <>
      <Button className="mt-5 w-full" onClick={() => setIsDialogOpen(true)} disabled={saving}>
        {saving ? "Updating..." : actionLabel}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isDowngrade ? "Schedule downgrade" : "Upgrade plan"}</DialogTitle>
            <DialogDescription>
              {isDowngrade
                ? `${currentPlanName} remains active until its current billing period ends. ${planName} activates automatically after that.`
                : `${planName} activates immediately and replaces ${currentPlanName}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={() => void changePlan()} disabled={saving}>
              {saving ? "Updating..." : isDowngrade ? "Schedule downgrade" : "Confirm upgrade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
