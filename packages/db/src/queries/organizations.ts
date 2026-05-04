import { randomBytes } from "crypto";
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
    const existing = await tx.organization.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const org = await tx.organization.create({
      data: {
        name:            data.name,
        slug:            finalSlug,
        plan:            "ENTERPRISE",
        defaultCurrency: data.defaultCurrency  ?? "CAD",
        defaultLocale:   data.defaultLocale    ?? "fr-CA",
        defaultTimezone: data.defaultTimezone  ?? "America/Toronto",
        maxSeats:        10,
      },
    });

    await tx.organizationMembership.create({
      data: {
        userId:             data.creatorUserId,
        organizationId:     org.id,
        role:               "ADMIN",
        canViewTeamHistory: true,
      },
    });

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

export async function getUserOrgs(userId: string) {
  return prisma.organizationMembership.findMany({
    where:   { userId, removedAt: null },
    include: { organization: true },
    orderBy: { joinedAt: "asc" },
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
      branches: { orderBy: { createdAt: "asc" } },
      invitations: {
        where:   { acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      },
      subscription: true,
    },
  });
}

export async function updateOrg(
  orgId: string,
  data: Partial<{
    name: string;
    website: string | null;
    defaultCurrency: string;
    defaultLocale: string;
    defaultTimezone: string;
    referenceCurrency: string;
    historyRetentionDays: number;
    allowResultSharing: boolean;
    allowExternalSharing: boolean;
    enforce2FA: boolean;
  }>
): Promise<void> {
  await prisma.organization.update({ where: { id: orgId }, data });
}

// ─── Branches ────────────────────────────────────────────────────────────────

export async function createBranch(orgId: string, data: {
  name: string;
  country?: string;
  province?: string | null;
  city?: string | null;
  timezone?: string;
  currency?: string;
  isHeadquarters?: boolean;
}): Promise<void> {
  if (data.isHeadquarters) {
    await prisma.branch.updateMany({
      where: { organizationId: orgId },
      data:  { isHeadquarters: false },
    });
  }
  await prisma.branch.create({
    data: {
      organizationId: orgId,
      name:           data.name,
      country:        data.country        ?? "CA",
      province:       data.province       ?? null,
      city:           data.city           ?? null,
      timezone:       data.timezone       ?? "America/Toronto",
      currency:       data.currency       ?? "CAD",
      isHeadquarters: data.isHeadquarters ?? false,
    },
  });
}

export async function updateBranch(branchId: string, data: Partial<{
  name: string;
  country: string;
  province: string | null;
  city: string | null;
  timezone: string;
  currency: string;
  isHeadquarters: boolean;
}>): Promise<void> {
  await prisma.branch.update({ where: { id: branchId }, data });
}

export async function deleteBranch(branchId: string): Promise<void> {
  await prisma.branch.delete({ where: { id: branchId } });
}

// ─── Membres ─────────────────────────────────────────────────────────────────

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
      where:  { userId_organizationId: { userId, organizationId: orgId } },
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

export async function updateMemberRole(
  orgId: string,
  userId: string,
  role: OrgRole,
  updatedBy: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.organizationMembership.update({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      data:  { role },
    });

    await tx.auditLog.create({
      data: {
        organizationId: orgId,
        userId:         updatedBy,
        action:         "member.role_updated",
        targetType:     "User",
        targetId:       userId,
        metadata:       { role },
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

// ─── Invitations ─────────────────────────────────────────────────────────────

export async function createInvitation(orgId: string, data: {
  email: string;
  role: OrgRole;
  invitedBy: string;
  branchId?: string | null;
}) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  return prisma.organizationInvitation.create({
    data: {
      organizationId: orgId,
      email:          data.email,
      role:           data.role,
      invitedBy:      data.invitedBy,
      branchId:       data.branchId ?? null,
      token,
      expiresAt,
    },
  });
}

export async function getInvitationByToken(token: string) {
  return prisma.organizationInvitation.findUnique({
    where:   { token },
    include: { organization: true },
  });
}

export async function acceptInvitation(token: string, userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const invite = await tx.organizationInvitation.findUniqueOrThrow({
      where: { token },
    });

    if (invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new Error("INVITATION_INVALID");
    }

    const org = await tx.organization.findUniqueOrThrow({
      where: { id: invite.organizationId },
    });
    const activeCount = await tx.organizationMembership.count({
      where: { organizationId: org.id, removedAt: null },
    });

    if (activeCount >= org.maxSeats) {
      throw new Error(`SEATS_LIMIT_REACHED:${org.maxSeats}`);
    }

    await tx.organizationMembership.upsert({
      where:  { userId_organizationId: { userId, organizationId: invite.organizationId } },
      update: { role: invite.role, branchId: invite.branchId, removedAt: null, removedBy: null },
      create: { userId, organizationId: invite.organizationId, role: invite.role, branchId: invite.branchId },
    });

    await tx.organizationInvitation.update({
      where: { token },
      data:  { acceptedAt: new Date() },
    });

    await tx.auditLog.create({
      data: {
        organizationId: invite.organizationId,
        userId,
        action:     "member.invitation_accepted",
        targetType: "User",
        targetId:   userId,
        metadata:   { role: invite.role, invitedBy: invite.invitedBy },
      },
    });
  });
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  await prisma.organizationInvitation.delete({ where: { id: invitationId } });
}

// ─── Accès ───────────────────────────────────────────────────────────────────

export async function getMembership(orgId: string, userId: string) {
  return prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
}

export async function isOrgAdmin(orgId: string, userId: string): Promise<boolean> {
  const m = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return m?.role === "ADMIN" && m?.removedAt === null;
}

export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
  const m = await prisma.organizationMembership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return !!m && m.removedAt === null;
}

export async function updateOrgPlan(
  orgId: string,
  plan: Plan,
): Promise<void> {
  await prisma.organization.update({ where: { id: orgId }, data: { plan } });
}
