{
  lib,
  buildNpmPackage,
  nodejs_24,
  runCommand,
  python3,
  midnight-did-npm-artifacts,
  compact-toolchain,
  compact-midnight,
  midnight-circuit-params,
  src,
}:

let
  # The 5 midnight-did .tgz files that must come from the flake input.
  # midnight-did-secret-storage is NOT among these — it stays from the
  # committed source tree because it is not a midnight-did artifact workspace.
  vendorPackagesFromFlake = [
    "midnight-did"
    "midnight-did-api"
    "midnight-did-contract"
    "midnight-did-domain"
    "midnight-did-jubjub-schnorr"
  ];

  # Map from vendor package short name to lockfile v3 path
  vendorLockfilePaths = {
    "midnight-did"              = "node_modules/@midnight-ntwrk/midnight-did";
    "midnight-did-api"          = "node_modules/@midnight-ntwrk/midnight-did-api";
    "midnight-did-contract"     = "node_modules/@midnight-ntwrk/midnight-did-contract";
    "midnight-did-domain"       = "node_modules/@midnight-ntwrk/midnight-did-domain";
    "midnight-did-jubjub-schnorr" = "node_modules/@midnight-ntwrk/midnight-did-jubjub-schnorr";
    "midnight-did-secret-storage" = "node_modules/@midnight-ntwrk/midnight-did-secret-storage";
  };

  # Replace the 5 committed vendor .tgz files with those from midnight-did's
  # npm-artifacts flake output and patch the lockfile so that:
  #   1. The `resolved` field is stripped from file: entries (fetchNpmDeps
  #      cannot fetch file:// URLs, but npm ci still resolves them from
  #      package.json dependency specs and the on-disk .tgz files).
  #   2. Integrity hashes are recomputed for the 5 replaced .tgz files
  #      (npm pack is non-deterministic, so flake-built tarballs differ
  #      from the committed ones).
  patchedSrc = runCommand "vc-patched-src" {
    inherit src;
    nativeBuildInputs = [ python3 ];
  } ''
    cp -r $src $out
    chmod -R u+w $out

    # Replace 5 vendor .tgz files with those from midnight-did npm-artifacts
    for pkg in ${lib.concatStringsSep " " vendorPackagesFromFlake}; do
      tgzName="midnight-ntwrk-''${pkg}-0.1.0.tgz"
      ln -sf ${midnight-did-npm-artifacts}/$tgzName \
        $out/tooling/vendor/midnight-did/$tgzName
    done

    # Patch package-lock.json and package.json:
    python3 <<'PYEOF'
    import json, hashlib, base64, os

    out = os.environ["out"]

    # --- Patch package-lock.json ---
    #
    #   - Strip `resolved` field from all 6 vendor file: entries so that
    #     fetchNpmDeps / prefetch-npm-deps skips them instead of failing on
    #     file:// URLs.
    #   - Recompute integrity hashes for the 5 .tgz files we replaced with
    #     midnight-did npm-artifacts (the committed and flake-built tarballs
    #     have different byte content).
    lockfile_path = os.path.join(out, "package-lock.json")
    with open(lockfile_path) as f:
        lockfile = json.load(f)

    vendor_lockfile_paths = ${builtins.toJSON vendorLockfilePaths}
    vendor_dir = os.path.join(out, "tooling", "vendor", "midnight-did")
    flake_pkgs = set(${builtins.toJSON vendorPackagesFromFlake})

    for pkg_short, lockfile_key in vendor_lockfile_paths.items():
        if lockfile_key not in lockfile.get("packages", {}):
            print(f"WARNING: {lockfile_key} not found in lockfile packages")
            continue

        entry = lockfile["packages"][lockfile_key]

        # Strip the `resolved` field so prefetch-npm-deps skips this entry.
        # npm ci resolves file: dependencies from package.json + on-disk .tgz
        # files; the lockfile `resolved` field is not required for this.
        if "resolved" in entry:
            print(f"Stripped resolved from {pkg_short}: {entry.pop('resolved')}")

        # Recompute integrity for the 5 .tgz files we replaced from the flake input.
        # midnight-did-secret-storage stays from the committed source tree, so its
        # integrity hash is already correct.
        if pkg_short in flake_pkgs:
            tgz_name = f"midnight-ntwrk-{pkg_short}-0.1.0.tgz"
            tgz_path = os.path.realpath(os.path.join(vendor_dir, tgz_name))

            with open(tgz_path, "rb") as f:
                content = f.read()

            integrity_hash = hashlib.sha512(content).digest()
            integrity = "sha512-" + base64.b64encode(integrity_hash).decode()

            old_integrity = entry.get("integrity", "N/A")
            entry["integrity"] = integrity
            print(f"Updated integrity for {pkg_short}: {old_integrity[:30]}... -> {integrity[:30]}...")

    with open(lockfile_path, "w") as f:
        json.dump(lockfile, f, indent=2)
        f.write("\n")

    # --- Patch package.json ---
    #
    # Strip the root postinstall script. The postinstall aliases and path
    # patches (ensure-midnight-did-package-aliases, ensure-midnight-did-api-paths,
    # ensure-compact-package-aliases) must be run after npm ci — they depend on
    # the exact shape of installed midnight-did packages, which differs between
    # committed .tgz files and Nix-built ones. TASK-7.4 reintroduces these as
    # explicit build steps once the packaging pipeline is wired up.
    pkg_json_path = os.path.join(out, "package.json")
    with open(pkg_json_path) as f:
        pkg_json = json.load(f)

    if "postinstall" in pkg_json.get("scripts", {}):
        old_script = pkg_json["scripts"].pop("postinstall")
        print(f"Stripped postinstall: {old_script[:80]}...")
    if "hasInstallScript" in lockfile.get("packages", {}).get("", {}):
        del lockfile["packages"][""]["hasInstallScript"]
        with open(lockfile_path, "w") as f:
            json.dump(lockfile, f, indent=2)
            f.write("\n")
        print("Stripped hasInstallScript from lockfile root")

    with open(pkg_json_path, "w") as f:
        json.dump(pkg_json, f, indent=2)
        f.write("\n")
    PYEOF
  '';

in
buildNpmPackage {
  pname = "midnight-vc-npm-artifacts";
  version = "0.1.0";

  src = patchedSrc;

  nodejs = nodejs_24;

  npmDepsHash = "sha256-Am/5dPQwfIPD7pPAhO+RONE9i0w4DhZydpjYohnYhQ4=";
  npmDepsFetcherVersion = 2;



  nativeBuildInputs = [
    compact-midnight
    compact-toolchain
  ];

  buildPhase = ''
    runHook preBuild

    export COMPACT_DIRECTORY=${compact-toolchain}
    export HOME=$TMPDIR

    # Pre-populate zkir circuit parameters (required for compact compile in offline sandbox)
    mkdir -p $HOME/.cache/midnight/zk-params
    cp -r ${midnight-circuit-params}/* $HOME/.cache/midnight/zk-params/

    # Run postinstall scripts that were stripped from package.json
    # (ensure-midnight-did-api-paths is NOT run here: the flake-built .tgz
    # restructures config.js to re-export from package-paths.js, so patching
    # package-paths.js via substituteInPlace below is sufficient.)
    node ./tooling/scripts/ensure-midnight-did-package-aliases.mjs
    node ./tooling/scripts/ensure-compact-package-aliases.mjs

    # Patch midnight-did-api contract path: the flake-built .tgz uses package-paths.js
    # for the contract path config. config.js re-exports from package-paths.js, so
    # patching package-paths.js is sufficient.
    # The ensure-midnight-did-api-paths.mjs script cannot be used here — it expects
    # the path string to be inline in config.js, but the flake-built layout
    # moved it to package-paths.js, causing the script to throw.
    substituteInPlace node_modules/@midnight-ntwrk/midnight-did-api/dist/package-paths.js \
      --replace-fail '"contract", "src", "managed", "did"' '"midnight-did-contract", "dist", "managed", "did"'

    # Build all 14 workspaces in dependency layer order.
    # No turbo — its caching and parallel scheduling provide zero value in a
    # clean Nix sandbox. Explicit ordering is simpler, more auditable, and
    # consistent with the pack-artifacts.sh pattern.

    ## Layer 1: core primitives (no vc-internal deps)
    npm run build -w packages/core/primitives/credentials

    ## Layer 2: depend on credentials
    npm run build -w packages/registry/status-registry
    npm run build -w packages/core/capabilities/same-holder
    npm run build -w packages/core/primitives/iso-registry

    ## Layer 3: pure TypeScript (no compact compile)
    npm run build -w packages/components/adapters/offchain-did
    npm run build -w packages/protocols/openid

    ## Layer 4: credential families (depend on layers 1-3)
    npm run build -w packages/prototypes/credential-families/birth
    npm run build -w packages/prototypes/credential-families/birth-secret
    npm run build -w packages/prototypes/credential-families/hello-family
    npm run build -w packages/prototypes/credential-families/dummy-claims
    npm run build -w packages/prototypes/credential-families/mixed-claims
    npm run build -w packages/prototypes/credential-families/university-diploma
    npm run build -w packages/prototypes/credential-families/digital-passport

    ## Layer 5: orchestration (depends on birth + age-gate contracts)
    npm run build -w packages/components/orchestration/protocol

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    # Pre-populate circuit parameters again for digital-passport's prepack → compact compile
    export HOME=$TMPDIR
    mkdir -p $HOME/.cache/midnight/zk-params
    cp -r ${midnight-circuit-params}/* $HOME/.cache/midnight/zk-params/

    export COMPACT_DIRECTORY=${compact-toolchain}

    # Patch pack-artifacts.sh: replace git rev-parse with PWD (no .git in sandbox)
    substituteInPlace tooling/scripts/pack-artifacts.sh \
      --replace-fail 'ROOT_DIR="$(git rev-parse --show-toplevel)"' 'ROOT_DIR="$PWD"'

    mkdir -p $out
    bash tooling/scripts/pack-artifacts.sh "$out"

    runHook postInstall
  '';

  meta = with lib; {
    description = "Midnight verifiable credentials npm artifact tarballs";
    homepage = "https://github.com/midnight-ntwrk/midnight-verifiable-credentials";
    license = lib.licenses.asl20;
    platforms = compact-toolchain.meta.platforms;
  };
}
