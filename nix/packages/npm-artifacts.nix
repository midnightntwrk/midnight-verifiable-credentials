{
  lib,
  stdenvNoCC,
  nodejs_24,
  pnpm_11,
  fetchPnpmDeps,
  pnpmConfigHook,
  compact-toolchain,
  compact-midnight,
  midnight-circuit-params,
  src,
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "midnight-vc-npm-artifacts";
  version = "0.3.0";

  inherit src;

  # Match the repository's pinned pnpm major so Nix evaluates the same
  # workspace and lockfile format as CI. Fail deliberately when a flake update
  # changes pnpm so the repository pin must be updated in the same review.
  pnpmInstallFlags = [ "--config.pm-on-fail=error" ];
  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version;
    inherit (finalAttrs) pnpmInstallFlags;
    inherit src;
    pnpm = pnpm_11;
    hash = "sha256-SZYf5NQV5q5FbNszQ4/K7LJCnClVmOHER6t7sBK5d5c=";
    fetcherVersion = 4;
  };

  nativeBuildInputs = [
    compact-midnight
    compact-toolchain
    nodejs_24
    pnpm_11
    pnpmConfigHook
  ];

  dontBuild = true;

  installPhase = ''
    runHook preInstall

    export PATH=${pnpm_11}/bin:$PATH
    export PNPM_CONFIG_PM_ON_FAIL=error
    # Pre-populate circuit parameters for package prepack Compact compilation.
    export HOME=$TMPDIR
    mkdir -p $HOME/.cache/midnight/zk-params
    cp -r ${midnight-circuit-params}/* $HOME/.cache/midnight/zk-params/

    export COMPACT_DIRECTORY=${compact-toolchain}

    mkdir -p $out
    # Consumer fixtures need registry-only dev tools; CI runs them outside the
    # network-isolated Nix build after validating the same tarball contract.
    bash tooling/scripts/pack-artifacts.sh "$out" --skip-consumer-tests

    runHook postInstall
  '';

  meta = with lib; {
    description = "Midnight verifiable credentials npm artifact tarballs";
    homepage = "https://github.com/midnight-ntwrk/midnight-verifiable-credentials";
    license = lib.licenses.asl20;
    platforms = compact-toolchain.meta.platforms;
  };
})
