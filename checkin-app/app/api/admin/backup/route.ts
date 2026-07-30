import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthError, requireSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

// Full JSON backup of business data (owner only). Signatures and photo binary
// data are included — treat the downloaded file as sensitive. For managed
// backups use Supabase's daily backups / PITR (see docs/SUPABASE_SETUP.md).
export async function GET() {
  try {
    const session = await requireSession({ owner: true });
    const [customers, checkIns, consents, followUps, photos, templates, users, auditLogs] =
      await Promise.all([
        prisma.customer.findMany(),
        prisma.checkIn.findMany(),
        prisma.consentRecord.findMany(),
        prisma.followUp.findMany(),
        prisma.photo.findMany(),
        prisma.messageTemplate.findMany(),
        prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, active: true, createdAt: true } }),
        prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 }),
      ]);

    await audit(session, "backup.download");

    const body = JSON.stringify({
      exportedAt: new Date().toISOString(),
      app: "aileens-beauty-checkin",
      customers, checkIns, consents, followUps, photos, templates, users, auditLogs,
    });

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="aileens-beauty-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("backup failed", err);
    return NextResponse.json({ error: "Backup failed." }, { status: 500 });
  }
}
