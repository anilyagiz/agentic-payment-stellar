import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);
  const where = address ? { sourceAccount: address } : {};

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    take: limit
  });

  return NextResponse.json({
    count: transactions.length,
    transactions
  });
}
