const INSTALLER =
  "https://raw.githubusercontent.com/hara-lang/hara-cli/main/install.sh";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("method not allowed\n", {
        status: 405,
        headers: { Allow: "GET, HEAD", ...CORS },
      });
    }

    if (url.pathname === "/healthz") {
      return Response.json(
        { service: "hara-cli", installer: "hara-lang/hara-cli" },
        { headers: { "Cache-Control": "no-store", ...CORS } },
      );
    }

    if (url.pathname !== "/" && url.pathname !== "/install") {
      return new Response("not found\n", { status: 404, headers: CORS });
    }

    const upstream = await fetch(INSTALLER, {
      headers: { "User-Agent": "hara-cli-installer" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response("installer unavailable\n", {
        status: 503,
        headers: { "Cache-Control": "no-store", ...CORS },
      });
    }

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      headers: {
        "Content-Type": "text/x-shellscript; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
        ...CORS,
      },
    });
  },
};
