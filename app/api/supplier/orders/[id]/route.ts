import { forwardBackendRequest } from "@/lib/auth/backend";

type RouteContext = { params: Promise<{ id: string }> };

async function forward(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return forwardBackendRequest(request, `/api/v1/supplier/orders/${encodeURIComponent(id)}`);
}

export const PATCH = forward;
export const POST = forward;
