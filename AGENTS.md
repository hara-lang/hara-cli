# Repository guidance

## Responsibility and authority

Hara CLI is the distribution authority for the public installer and the
`cli.hara-lang.org` Worker. `install.sh` owns release download, platform
selection, and checksum verification. `worker/src/index.js` owns the landing
page, health endpoint, redirect, and static image routing. The Hara runtime is
built and released by `hara-lang/hara`; this repository does not own runtime
implementation or package trust.

Read [README.md](README.md), `install.sh`, the Worker manifest and package,
Worker tests, and the
[deployment workflow](.github/workflows/deploy.yml) before editing.

## Prerequisites

- Node.js 22 and npm for Worker tests.
- POSIX shell, `curl` or `wget`, `tar`, and `sha256sum` or `shasum` for the
  installer.
- The compiled Hara release binary from the path described in
  `test/install.test.sh` for the functional installer test. That binary comes
  from an external Hara checkout and is not part of this repository.
- Cloudflare account and API-token access only for deployment.

Never put release credentials or Cloudflare tokens in the repository.

## Validation

Focused Worker validation:

```sh
(cd worker && node --test --test-name-pattern="installer endpoint" test/*.test.mjs)
```

Normal Worker validation:

```sh
(cd worker && npm test)
```

The installer functional test is:

```sh
sh test/install.test.sh
```

It is access/toolchain-gated until the Hara release binary exists at the
expected `HARA_WORKSPACE_ROOT` path. CI runs the Worker tests, Cloudflare
deployment, and a live OG-metadata smoke check through
`.github/workflows/deploy.yml`. Run `git diff --check` for map changes.

## Generated output and deployment

There is no generated source in this repository. Release binaries and
checksums are produced from immutable Hara release assets; `install.sh` and
the Worker page are authored source. The
[deploy workflow](.github/workflows/deploy.yml) is gated by the `[deploy]`
merge title for closed pull requests and deploys `worker/` to the custom
`cli.hara-lang.org` route in `worker/wrangler.jsonc`.

## Limits and cleanup

The endpoint does not build Hara, publish package archives, or establish
signing trust. The functional installer test proves a local fake release only,
while the deployment workflow additionally requires Cloudflare access and live
DNS/route readiness. Its test fixture cleans `.tmp/install-test`; remove any
interrupted fixture before rerunning.

For rollout work, follow
[hara-lang/.github](https://github.com/hara-lang/.github/blob/main/docs/connector-first-delivery.md),
name `https://github.com/greenways-ai/workspace/issues/30` as the sole Primary
issue, and use `Advances` for workspace issue #26.
