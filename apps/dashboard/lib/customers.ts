import { CustomerStatus } from "@prisma/client";
import { prisma } from "./db";

export type CustomerLifecycleInput = {
  name: string;
  email: string;
  company?: string | null | undefined;
  plan?: string | undefined;
  monthlyVolumeUsd?: string | undefined;
  status?: CustomerStatus;
  source?: string | undefined;
  walletPublicKey?: string | null | undefined;
  notes?: string | null | undefined;
  agentId?: string | null | undefined;
};

export async function upsertCustomer(input: CustomerLifecycleInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const company = input.company?.trim() || null;
  const plan = input.plan?.trim() || "Starter";
  const monthlyVolumeUsd = input.monthlyVolumeUsd?.trim() || "0";
  const source = input.source?.trim() || "pricing";
  const notes = input.notes?.trim() || null;

  return prisma.customer.upsert({
    where: { email: normalizedEmail },
    create: {
      name,
      email: normalizedEmail,
      company,
      plan,
      monthlyVolumeUsd,
      status: input.status ?? CustomerStatus.lead,
      source,
      walletPublicKey: input.walletPublicKey ?? null,
      notes,
      agentId: input.agentId ?? null
    },
    update: {
      name,
      company,
      plan,
      monthlyVolumeUsd,
      status: input.status ?? CustomerStatus.lead,
      source,
      walletPublicKey: input.walletPublicKey ?? null,
      notes,
      agentId: input.agentId ?? null,
      lastContactAt: new Date()
    }
  });
}
