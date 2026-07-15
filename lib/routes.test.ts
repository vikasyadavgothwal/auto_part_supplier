import { describe, expect, it } from "vitest"

import { appBasePath, appRoutes, stripBasePath } from "./routes"

describe("supplier dashboard routes", () => {
  it("uses the supplier dashboard base path by default", () => {
    expect(appBasePath).toBe("/dashboard")
  })

  it("normalizes the dashboard root to the dashboard route", () => {
    expect(stripBasePath("/dashboard")).toBe(appRoutes.dashboard)
    expect(stripBasePath("/dashboard/")).toBe(appRoutes.dashboard)
  })

  it("strips the configured base path from nested routes", () => {
    expect(stripBasePath("/dashboard/inventory")).toBe(appRoutes.inventory)
  })

  it("leaves unrelated routes unchanged", () => {
    expect(stripBasePath("/login")).toBe(appRoutes.login)
  })
})
