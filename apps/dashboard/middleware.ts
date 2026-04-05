import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  "https://stellaragent.vercel.app"
].filter(Boolean);

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin") || "";
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || !origin;

  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
  }
  
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key, x-indexer-secret");
  response.headers.set("Access-Control-Max-Age", "86400");

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://soroban-testnet.stellar.org https://mainnet.stellar.org https://horizon-testnet.stellar.org https://horizon.stellar.org https://api.openai.com; font-src 'self'; object-src 'none'; media-src 'self'; frame-src 'none';"
  );

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { 
      status: 204,
      headers: response.headers
    });
  }

  const contentLength = request.headers.get("content-length");
  const maxSize = 1024 * 1024; // 1MB
  if (contentLength && parseInt(contentLength, 10) > maxSize) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 }
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
