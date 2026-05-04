import { prisma } from "../index";
import type { OrgRole, Organization, Plan } from "@prisma/client";

export async function createOrganization(data: {
  name: string;
  creatorUserId: string;
  defaultCurrency?: string;
  defaultLocale?: string;
  defaultTimezone?: string;
}): Promise<Organization> {
  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return prisma.$transaction(async (tx) => {
    // Garantir l'unicité du slug
    const existing = await tx.organization.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const org = await tx.organization.create({
      data: {
        name:             data.name,
        slug:             finalSlug,
        plan:             "ENTERPRISE",
        defaultCurrency:  data.defaultCurrency  ?? "CAD",
        defaultLocale:    data.defaultLocale    ?? "fr-CA",
        defaultTimezone:  data.defaultTimezone  ?? "America/Toronto",
        maxSeats:         10,
      },
    });

    // Le créateur devient admin automatiquement
    await tx.organizationMembership.create({
      data: {
        userId:               data.creatorUserId,
        organizationId:       org.id,
        role:                 "ADMIN",
        canViewTeamHistory:   true,
      },
    });

    // Log d'audit
    await tx.auditLog.create({
      data: {
        organizationId: org.id,
        userId:         data.creatorUserId,
        action:         "org.created",
        targetType:     "Organization",
        targetId:       org.id,
      },
    });

    return org;
  });
}

export async function getOrgWithMembers(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      memberships: {
        where:   { removedAt: null },
        include: { user: true, branch: true },
        orderBy: { joinedAt: "asc" },
      },
      branches: true,
    },
  });
}

export async function addMember(
  orgId: string,
  userId: string,
  role: OrgRole,
  addedBy: string,
  branchId?: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.findUniqueOrThrow({ where: { id: orgId } });
    const activeCount = await tx.organizationMembership.count({
      where: { organizationId: orgId, removedAt: null },
    });

    if (activeCount >= org.maxSeats) {
      throw new Error(`SEATS_LIMIT_REACHED:${org.maxSeats}`);
    }

    await tx.organizationMembership.upsert({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      update: { role, branchId: branchId ?? null, removedAt: null, removedBy: null },
      create: { userId, organizationId: orgId, role, branchId: branchId ?? null },
    });

    await tx.auditLog.create({
      data: {
        organizationId: orgId,
        userId:         addedBy,
        action:         "member.added",
        targetType:     "User",
        targetId:       userId,
        metadata:       { role, branchId },
      },
    });
  });
}

export async function removeMember(
  orgId: string,
  userId: string,
  removedBy: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.organizationMembership.update({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      data:  { removedAt: new Date(), removedBy },
    });

    await tx.auditLog.create({
      data: {
        organizationId: orgId,
        userId:         removedBy,
        action:         "member.removed",
        targetType:     "User",
        targetId:       userId,
      },
    });
  });
}

export async function isOrgAdmin(orgId: string, userId: string): Promise<boolean> {
  const membership = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return membership?.role === "ADMIN" && membership?.removedAt === null;
}

export async function updateOrgPlan(
  orgId: string,
  plan: Plan,
  stripeSubscriptionId?: string
): Promise<void> {
  await prisma.organization.update({
    where: { id: orgId },
    data:  { plan },
  });
}
