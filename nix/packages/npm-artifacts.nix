{
  lib,
  buildNpmPackage,
  nodejs_24,
  runCommand,
  python3,
  midnight-did-npm-artifacts,
  compact-toolchain,
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

  npmDepsHash = "sha256-RyGQhLcoYlN3JbeIOslVauRHfBjj/kMS8/n++kjeSJw=";
  npmDepsFetcherVersion = 2;



  nativeBuildInputs = [
    compact-toolchain
  ];

  # Placeholder build phase — TASK-7.4 fills in the real build + packaging
  buildPhase = ''
    runHook preBuild
    echo "npm-artifacts: dependency resolution verified (build phase is TASK-7.4)"
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir $out
    echo "npm-artifacts: packaging is TASK-7.4" > $out/README
    runHook postInstall
  '';

  meta = with lib; {
    description = "Midnight verifiable credentials npm artifact tarballs";
    homepage = "https://github.com/midnight-ntwrk/midnight-verifiable-credentials";
    license = lib.licenses.asl20;
    platforms = compact-toolchain.meta.platforms;
  };
}
