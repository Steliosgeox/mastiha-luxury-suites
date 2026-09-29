import { cookies } from "next/headers";
import { ADMIN_COOKIE, createSession, passwordMatches } from "@/lib/chat/auth";
import { limit, requireStore } from "@/lib/chat/service";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = requireStore();
    await limit(store, request, "login", 8, 15 * 60);
    const body = await readJson(request, 1024) as { password?: unknown } | null;
    if (typeof body?.password !== "string" || !passwordMatches(body.password)) throw new RequestFailure(401, "Wrong password.");
    const session = createSession();
    (await cookies()).set(ADMIN_COOKIE, session.value, {
      httpOnly: true,
      secure: process.env.VERCEL === "1" || new URL(request.url).protocol === "https:",
      sameSite: "strict",
      path: "/",
      maxAge: session.maxAge,
    });
    return json({ ok: true });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    (await cookies()).delete(ADMIN_COOKIE);
    return json({ ok: true });
  } catch (error) { return failure(error); }
}
