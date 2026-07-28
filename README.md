# hara-cli

Hara CLI distribution authority.

`hara-lang/hara` remains the runtime source repository. This repository owns
the installer, release metadata, and the public CLI distribution endpoint:

```sh
curl -fsSL https://cli.hara-lang.org/install | sh -- --rust
```

The endpoint serves [`install.sh`](./install.sh) from this repository. Release
assets are published here by the protected release workflow after they have
been built from an immutable `hara-lang/hara` commit.

The package registry is separate:

- `hara-lang/hara-packages` is the reviewed package registry.
- `hara-lang/hara-identity` is the public signing-key and policy repository.

## Worker

`worker/` configures the `cli.hara-lang.org` Worker. Its `/install` endpoint
fetches this repository's installer source only; it does not serve package
archives or establish package trust.
