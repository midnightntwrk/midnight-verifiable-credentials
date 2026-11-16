# SPDX-License-Identifier: Apache-2.0
# Official compactc-v0.36.0 release assets; hashes are the raw zip SHA-256
# digests published by GitHub, not fetchzip/unpacked-tree hashes.
{
  lib,
  stdenvNoCC,
  fetchurl,
  unzip,
}:

let
  version = "0.36.0";
  platforms = {
    x86_64-linux = {
      target = "x86_64-unknown-linux-musl";
      hash = "7017b6121ebb9d53a562984bca616d143ef84fc7ee18b4da6c3a0a6615cb5e97";
    };
    aarch64-darwin = {
      target = "aarch64-darwin";
      hash = "a8126b2cc06230ed2c6558059a8945119e370ff222930e6a52f90870e8cc3c5d";
    };
  };
  platform = platforms.${stdenvNoCC.hostPlatform.system} or null;
in
assert lib.asserts.assertMsg (platform != null) "Unsupported Compact toolchain platform";
stdenvNoCC.mkDerivation {
  pname = "compact-toolchain";
  inherit version;

  src = fetchurl {
    url = "https://github.com/midnightntwrk/compact/releases/download/compactc-v${version}/compactc_v${version}_${platform.target}.zip";
    sha256 = platform.hash;
  };
  nativeBuildInputs = [ unzip ];
  sourceRoot = ".";

  # compact devtool 0.5.1 reads the absolute bin/compactc symlink to locate
  # versions/<version>/<platform>. Do not relativize that link in fixup.
  dontRewriteSymlinks = true;
  installPhase = ''
    runHook preInstall
    compact_dir="$out/versions/${version}/${platform.target}"
    mkdir -p "$compact_dir" "$out/bin"
    # Extract only upstream asset entries, never stdenv's build environment
    # files (sourceRoot is the zip's flat layout).
    unzip -q "$src" -d "$compact_dir"

    # The upstream shell wrapper otherwise locates compactc.bin relative to
    # bin/ when invoked via the symlink, rather than beside its real target.
    chmod +w "$compact_dir/compactc"
    substituteInPlace "$compact_dir/compactc" \
      --replace-fail 'thisdir="$(cd $(dirname $0) ; pwd -P)"' \
      "thisdir=\"$compact_dir\""

    for command in compactc fixup-compact format-compact; do
      ln -s "$compact_dir/$command" "$out/bin/$command"
    done
    runHook postInstall
  '';

  doInstallCheck = true;
  installCheckPhase = ''
    runHook preInstallCheck
    compiler_version="$("$out/bin/compactc" --version)"
    test "''${compiler_version%% *}" = "${version}"
    test "$("$out/bin/compactc" --ledger-version)" = "zkir-3.2.0-rc.2"
    # No build-environment metadata may leak into the toolchain archive.
    test ! -e "$out/versions/${version}/${platform.target}/env-vars"
    runHook postInstallCheck
  '';

  meta = {
    description = "Official Compact ${version} compiler with COMPACT_DIRECTORY layout";
    homepage = "https://github.com/midnightntwrk/compact/releases/tag/compactc-v${version}";
    license = lib.licenses.asl20;
    platforms = lib.attrNames platforms;
  };
}
