export async function GET() {
  return Response.json({
    ok: true,
    service: "stellaragent-dashboard",
    timestamp: new Date().toISOString()
  });
}
