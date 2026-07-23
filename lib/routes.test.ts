import { describe, expect, it } from "vitest"

import { appBasePath, appRoutes, stripBasePath } from "./routes"

describe("supplier dashboard routes", () => {
  it("does not use a config-level base path by default", () => {
    expect(appBasePath).toBe("")
  })

  it("keeps dashboard routes as normal application routes", () => {
    expect(stripBasePath("/dashboard")).toBe(appRoutes.dashboard)
    expect(stripBasePath("/dashboard/")).toBe("/dashboard/")
  })

  it("leaves nested dashboard routes unchanged", () => {
    expect(stripBasePath("/dashboard/inventory")).toBe("/dashboard/inventory")
  })

  it("leaves unrelated routes unchanged", () => {
    expect(stripBasePath("/login")).toBe(appRoutes.login)
  })
})
