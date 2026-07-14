"use client"

import { authenticatedFetch } from "@/lib/auth/client"

export type DashboardNotification = {
  id: string
  type: string
  title: string
  body: string
  linkUrl: string | null
  entityType: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export const notificationsApiPath = "/api/notifications"
export const notificationsStreamPath = "/api/notifications/stream"
export const notificationsReadAllPath = "/api/notifications/read-all"
export const notificationReadPath = (id: string) =>
  `/api/notifications/${encodeURIComponent(id)}/read`
export const notificationHref = (path: string) => path
export const notificationFetch = authenticatedFetch
