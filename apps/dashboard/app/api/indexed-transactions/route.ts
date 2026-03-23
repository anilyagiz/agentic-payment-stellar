import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);

  const transactions = await prisma.transaction.findMany({
    where: address ? { sourceAccount: address } : undefined,
    orderBy: { submittedAt: "desc" },
    take: limit
  });

  return NextResponse.json({
    count: transactions.length,
    transactions
  });
}
