import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { submittedAt: "desc" },
    take: 100
  });

  return NextResponse.json({ transactions });
}
