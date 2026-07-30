import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(notifications);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to load notifications." }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await requireSession();
    await prisma.notification.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update notifications." }, { status: 500 });
  }
}
