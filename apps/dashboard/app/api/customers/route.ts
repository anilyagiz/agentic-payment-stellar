import { NextRequest, NextResponse } from "next/server";
import { CustomerStatus } from "@prisma/client";
import { z } from "zod";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { upsertCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";

const CustomerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  company: z.string().min(1).max(120).optional(),
  plan: z.string().min(1).max(40).optional(),
  monthlyVolumeUsd: z.string().min(1).max(32).optional(),
  source: z.string().min(1).max(80).optional(),
  notes: z.string().max(280).optional(),
  walletPublicKey: z.string().min(1).max(120).optional(),
  agentId: z.string().min(1).max(120).optional(),
  status: z.enum(["lead", "trial", "active", "churned"]).optional()
});

function toCustomerStatus(status?: z.infer<typeof CustomerSchema>["status"]) {
  switch (status) {
    case "trial":
      return CustomerStatus.trial;
    case "active":
      return CustomerStatus.active;
    case "churned":
      return CustomerStatus.churned;
    default:
      return CustomerStatus.lead;
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = consumeRateLimit(`customers:${getClientIp(req)}`, 12, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many customer submissions" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const body = CustomerSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const customer = await upsertCustomer({
    name: body.data.name,
    email: body.data.email,
    company: body.data.company ?? null,
    plan: body.data.plan,
    monthlyVolumeUsd: body.data.monthlyVolumeUsd,
    status: toCustomerStatus(body.data.status),
    source: body.data.source,
    walletPublicKey: body.data.walletPublicKey ?? null,
    notes: body.data.notes ?? null,
    agentId: body.data.agentId ?? null
  });

  return NextResponse.json({
    customerId: customer.id,
    status: customer.status,
    email: customer.email,
    plan: customer.plan,
    source: customer.source
  });
}
