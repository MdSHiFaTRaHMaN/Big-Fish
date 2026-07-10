import { NextResponse } from "next/server";

/**
 * GET /api/download-pdf?url=<encoded-pdf-url>
 *
 * Fetches the PDF server-side (no CORS restriction) and streams it back
 * to the client with Content-Disposition: attachment so the browser
 * downloads it instead of opening it inline.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pdfUrl = searchParams.get("url");

  if (!pdfUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter." }, { status: 400 });
  }

  try {
    const upstream = await fetch(pdfUrl);

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${upstream.status} ${upstream.statusText}` },
        { status: 502 }
      );
    }

    const pdfBuffer = await upstream.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="design-summary.pdf"',
        "Content-Length": String(pdfBuffer.byteLength),
        // Allow the browser to cache the file briefly
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    console.error("PDF proxy error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
