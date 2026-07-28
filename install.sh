#!/bin/sh
# Hara CLI installer. Release assets are distributed by hara-lang/hara-cli.
#
#   curl -fsSL https://cli.hara-lang.org/install | sh -- --rust --truffle
set -eu

REPO="hara-lang/hara-cli"

info() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

INSTALL_RUST=false
INSTALL_TRUFFLE=false
for arg in "$@"; do
  case "$arg" in
    --rust) INSTALL_RUST=true ;;
    --truffle) INSTALL_TRUFFLE=true ;;
    -h|--help)
      printf '%s\n' 'Usage: install [--rust] [--truffle]'
      exit 0
      ;;
    *) die "unknown option: $arg (use --rust and/or --truffle)" ;;
  esac
done
[ "$INSTALL_RUST" = true ] || [ "$INSTALL_TRUFFLE" = true ] \
  || die 'choose at least one runtime: --rust and/or --truffle'

detect_triple() {
  case "$(uname -s)/$(uname -m)" in
    Linux/x86_64) printf '%s' x86_64-unknown-linux-gnu ;;
    Darwin/arm64) printf '%s' aarch64-apple-darwin ;;
    Darwin/x86_64) printf '%s' x86_64-apple-darwin ;;
    *) return 1 ;;
  esac
}

TRIPLE=${HARA_TARGET_TRIPLE:-$(detect_triple)} \
  || die 'unsupported platform; build from hara-lang/hara source instead'

if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1"; }
  fetch_to() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO- "$1"; }
  fetch_to() { wget -qO "$2" "$1"; }
else
  die 'neither curl nor wget found'
fi

if [ -n "${HARA_VERSION:-}" ]; then
  VERSION=$HARA_VERSION
else
  VERSION=$(fetch "https://api.github.com/repos/$REPO/releases?per_page=1" \
    | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' \
    | head -n 1)
  [ -n "$VERSION" ] || die 'could not resolve a CLI release; set HARA_VERSION explicitly'
fi

BASE_URL=${HARA_RELEASE_BASE_URL:-"https://github.com/$REPO/releases/download/$VERSION"}
INSTALL_DIR=${HARA_INSTALL_DIR:-"$HOME/.local/bin"}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT INT TERM

fetch_to "$BASE_URL/SHA256SUMS" "$TMP/SHA256SUMS" || die 'could not download checksums'
if command -v sha256sum >/dev/null 2>&1; then
  verify() { grep " $1$" "$TMP/SHA256SUMS" | (cd "$TMP" && sha256sum --check --status -); }
elif command -v shasum >/dev/null 2>&1; then
  verify() { grep " $1$" "$TMP/SHA256SUMS" | (cd "$TMP" && shasum -a 256 --check --status -); }
else
  die 'neither sha256sum nor shasum found; cannot verify downloads'
fi

install_runtime() {
  runtime=$1
  archive="hara-$runtime-$VERSION-$TRIPLE.tar.gz"
  fetch_to "$BASE_URL/$archive" "$TMP/$archive" || die "could not download $archive"
  verify "$archive" || die "checksum mismatch for $archive"
  tar -xzf "$TMP/$archive" -C "$TMP" || die "could not extract $archive"
  binary=hara
  [ "$runtime" = truffle ] && binary=hara-truffle
  [ -f "$TMP/$binary" ] || die "$archive did not contain $binary"
  mkdir -p "$INSTALL_DIR"
  install -m 755 "$TMP/$binary" "$INSTALL_DIR/$binary"
  info "installed $binary at $INSTALL_DIR/$binary"
}

[ "$INSTALL_RUST" = true ] && install_runtime rust
[ "$INSTALL_TRUFFLE" = true ] && install_runtime truffle
