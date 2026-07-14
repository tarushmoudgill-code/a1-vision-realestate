import { NextResponse } from "next/server";
import { requireAuth, audit, type SessionPayload } from "@/lib/auth";

// Re-export audit so admin route files can import it from a single module.
export { audit };

export type Ctx = { session: SessionPayload; params: Record<string, string> };

// Wrap an admin route handler with auth + optional section RBAC.
export function adminHandler(
  fn: (ctx: Ctx, req: Request) => Promise<Response> | Response,
  section?: string
) {
  return async (
    req: Request,
    { params }: { params: Promise<Record<string, string>> }
  ): Promise<Response> => {
    try {
      const session = await requireAuth(section);
      const p = await params;
      return await fn({ session, params: p }, req);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "ERROR";
      if (msg === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (msg === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}

export async function parseBody<T = unknown>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

// Parse JSON string fields safely
export function parseJson<T = unknown>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}
