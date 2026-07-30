import { prisma } from "./db";
import type { SessionUser } from "./auth";

export async function audit(
  user: SessionUser | null,
  action: string,
  entity?: string,
  entityId?: string,
  detail?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        detail: detail ?? null,
      },
    });
  } catch (err) {
    // Audit logging must never break the main operation.
    console.error("audit log failed", err);
  }
}
