import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";

export const runtime = "nodejs";

// Serves uploaded customer photos to signed-in staff only. Photos are stored
// as data URLs in the database and are never exposed on a public route.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await ctx.params;
    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const comma = photo.data.indexOf(",");
    const buf = Buffer.from(photo.data.slice(comma + 1), "base64");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": photo.mimeType,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Failed to load photo." }, { status: 500 });
  }
}
