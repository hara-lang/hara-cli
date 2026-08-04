const INSTALLER =
  "https://raw.githubusercontent.com/hara-lang/hara-cli/main/install.sh";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

const LANDING_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Install Hara</title>
  <meta name="description" content="Install Hara from the official CLI distribution endpoint.">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Hara">
  <meta property="og:title" content="Install Hara">
  <meta property="og:description" content="One command. Your choice of runtime.">
  <meta property="og:url" content="https://cli.hara-lang.org/">
  <meta property="og:image" content="https://cli.hara-lang.org/og-hara-cli.jpg">
  <meta property="og:image:secure_url" content="https://cli.hara-lang.org/og-hara-cli.jpg">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="3840">
  <meta property="og:image:height" content="2016">
  <meta property="og:image:alt" content="Hara CLI — install Hara">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Install Hara">
  <meta name="twitter:description" content="One command. Your choice of runtime.">
  <meta name="twitter:image" content="https://cli.hara-lang.org/og-hara-cli.jpg">
  <meta name="twitter:image:alt" content="Hara CLI — install Hara">
  <link rel="canonical" href="https://cli.hara-lang.org/">
</head>
<body>
  <main>
    <h1>Install Hara</h1>
    <p>Install the Rust runtime:</p>
    <pre><code>curl -fsSL https://cli.hara-lang.org/install | sh -- --rust</code></pre>
    <p><a href="https://www.hara-lang.org/docs/getting-started/cli/">Read the installation guide</a></p>
  </main>
</body>
</html>`;

export default {
  async fetch(request, env) {
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

    if (url.pathname === "/og-hara-cli.jpg") {
      return env.ASSETS.fetch(request);
    }

    if (url.pathname === "/") {
      return new Response(request.method === "HEAD" ? null : LANDING_PAGE, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    if (url.pathname !== "/install") {
      return new Response("not found\n", { status: 404, headers: CORS });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: INSTALLER,
        "Cache-Control": "public, max-age=300",
        ...CORS,
      },
    });
  },
};
