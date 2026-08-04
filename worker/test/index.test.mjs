import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

const env = {
  ASSETS: {
    fetch: async () => new Response("image", { headers: { "Content-Type": "image/jpeg" } }),
  },
};

test("root is a shareable HTML installation page", async () => {
  const response = await worker.fetch(new Request("https://cli.hara-lang.org/"), env);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(body, /property="og:image" content="https:\/\/cli\.hara-lang\.org\/og-hara-cli\.jpg"/);
  assert.match(body, /property="og:image:width" content="3840"/);
  assert.match(body, /name="twitter:card" content="summary_large_image"/);
});

test("installer endpoint keeps its distribution redirect contract", async () => {
  const response = await worker.fetch(new Request("https://cli.hara-lang.org/install"), env);

  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), "https://raw.githubusercontent.com/hara-lang/hara-cli/main/install.sh");
});

test("social image is served through the Worker assets binding", async () => {
  const response = await worker.fetch(new Request("https://cli.hara-lang.org/og-hara-cli.jpg"), env);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/jpeg");
});
