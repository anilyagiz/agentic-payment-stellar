import { prisma } from "@/lib/db";
import { getMissingEnvKeys } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const requiredEnvMissing = getMissingEnvKeys();

  let database = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "degraded";
  }

  const ready = requiredEnvMissing.length === 0 && database === "ok";

  return Response.json(
    {
      ok: ready,
      service: "stellaragent-dashboard",
      timestamp: new Date().toISOString(),
      checks: {
        database,
        env: requiredEnvMissing.length === 0 ? "ok" : "missing",
        missingEnv: requiredEnvMissing
      }
    },
    {
      status: ready ? 200 : 503
    }
  );
}
