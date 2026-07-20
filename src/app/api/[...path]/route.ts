import { NextRequest, NextResponse } from "next/server";

const getBackendBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5079";
  return baseUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
};

const buildUpstreamUrl = (request: NextRequest, path: string[]) => {
  const backendBase = getBackendBaseUrl();
  const joinedPath = path.join("/");
  const search = request.nextUrl.search || "";
  return `${backendBase}/api/${joinedPath}${search}`;
};

const proxyRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const upstreamUrl = buildUpstreamUrl(request, path);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const method = request.method.toUpperCase();
  const hasBody = !(method === "GET" || method === "HEAD");

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    // Remove hop-by-hop/compression headers that can break streamed proxy responses.
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    responseHeaders.delete("transfer-encoding");
    responseHeaders.delete("connection");
    responseHeaders.delete("keep-alive");

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Backend API tidak dapat diakses. Pastikan service backend berjalan dan NEXT_PUBLIC_API_URL sudah benar.",
      },
      { status: 502 }
    );
  }
};

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}
